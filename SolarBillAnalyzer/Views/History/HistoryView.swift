import SwiftUI
import SwiftData

struct HistoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @State private var viewModel = HistoryViewModel()
    @State private var selectedBill: Bill?
    @State private var showingDeleteConfirmation = false
    @State private var billToDelete: Bill?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if bills.isEmpty {
                    emptyState
                } else {
                    summaryCards
                    trendSection
                    billsList
                }
            }
            .padding()
        }
        .navigationTitle("Bill History")
        .navigationDestination(item: $selectedBill) { bill in
            BillBreakdownView(bill: bill)
        }
        .alert("Delete Bill?", isPresented: $showingDeleteConfirmation) {
            Button("Delete", role: .destructive) {
                if let bill = billToDelete {
                    modelContext.delete(bill)
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This action cannot be undone.")
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 50))
                .foregroundStyle(.secondary)

            Text("No Bills Yet")
                .font(.title3.bold())

            Text("Add your first bill to start tracking your energy costs over time.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 40)
    }

    private var summaryCards: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                summaryCard(
                    title: "Average Bill",
                    value: viewModel.averageBill(from: bills).asCurrency,
                    icon: "chart.bar.fill",
                    color: AppColors.solarBlue
                )
                summaryCard(
                    title: "Avg Usage",
                    value: viewModel.averageUsage(from: bills).asKWh,
                    icon: "bolt.fill",
                    color: AppColors.solarOrange
                )
            }

            if let change = viewModel.monthOverMonthChange(from: bills) {
                HStack(spacing: 12) {
                    changeCard(
                        title: "Cost Change",
                        change: change.amountChange,
                        icon: "dollarsign.circle.fill"
                    )
                    changeCard(
                        title: "Usage Change",
                        change: change.kWhChange,
                        icon: "bolt.circle.fill"
                    )
                }
            }
        }
    }

    private func summaryCard(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }

    private func changeCard(title: String, change: Double, icon: String) -> some View {
        let isUp = change > 0
        return VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(isUp ? .red : .green)
            HStack(spacing: 4) {
                Image(systemName: isUp ? "arrow.up.right" : "arrow.down.right")
                    .font(.caption)
                Text(abs(change).asPercentage)
                    .font(.headline)
            }
            .foregroundStyle(isUp ? .red : .green)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }

    private var trendSection: some View {
        NavigationLink {
            TrendChartView(bills: bills)
        } label: {
            HStack {
                Image(systemName: "chart.xyaxis.line")
                    .font(.title3)
                    .foregroundStyle(AppColors.solarBlue)
                VStack(alignment: .leading) {
                    Text("View Trends")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text("See your usage and cost patterns over time")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.tertiary)
            }
            .cardStyle()
        }
    }

    private var billsList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("All Bills (\(bills.count))")
                .font(.headline)

            ForEach(bills) { bill in
                Button {
                    selectedBill = bill
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(bill.provider)
                                .font(.subheadline.bold())
                                .foregroundStyle(.primary)
                            Text(bill.billingPeriodDescription)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            HStack(spacing: 4) {
                                Image(systemName: bill.inputMethod == .scan ? "camera.fill" : "keyboard.fill")
                                    .font(.caption2)
                                Text(bill.inputMethod == .scan ? "Scanned" : "Manual")
                                    .font(.caption2)
                            }
                            .foregroundStyle(.tertiary)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 4) {
                            Text(bill.totalAmount.asCurrency)
                                .font(.subheadline.bold())
                                .foregroundStyle(.primary)
                            Text(bill.totalKWh.asKWh)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Image(systemName: "chevron.right")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                    .padding()
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .contextMenu {
                    Button(role: .destructive) {
                        billToDelete = bill
                        showingDeleteConfirmation = true
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
    }
}
