import SwiftUI
import SwiftData

struct BillInputSelectionView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @State private var showingManualEntry = false
    @State private var showingScanner = false
    @State private var selectedBill: Bill?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    inputMethodSection
                    if !bills.isEmpty {
                        recentBillsSection
                    }
                }
                .padding()
            }
            .navigationTitle("Bills")
            .sheet(isPresented: $showingManualEntry) {
                ManualBillEntryView()
            }
            .sheet(isPresented: $showingScanner) {
                BillScannerView()
            }
            .navigationDestination(item: $selectedBill) { bill in
                BillBreakdownView(bill: bill)
            }
        }
    }

    private var inputMethodSection: some View {
        VStack(spacing: 16) {
            Text("Add a Bill")
                .font(.title2.bold())
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 16) {
                Button {
                    showingScanner = true
                } label: {
                    VStack(spacing: 12) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 32))
                        Text("Scan Bill")
                            .font(.headline)
                        Text("Take a photo of your utility bill")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .background(AppColors.solarBlue.opacity(0.1))
                    .foregroundStyle(AppColors.solarBlue)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(AppColors.solarBlue.opacity(0.3), lineWidth: 1)
                    )
                }

                Button {
                    showingManualEntry = true
                } label: {
                    VStack(spacing: 12) {
                        Image(systemName: "keyboard.fill")
                            .font(.system(size: 32))
                        Text("Enter Manually")
                            .font(.headline)
                        Text("Type in your bill details")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .background(AppColors.solarGreen.opacity(0.1))
                    .foregroundStyle(AppColors.solarGreen)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(AppColors.solarGreen.opacity(0.3), lineWidth: 1)
                    )
                }
            }
        }
    }

    private var recentBillsSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Recent Bills")
                    .font(.title3.bold())
                Spacer()
                NavigationLink("View All") {
                    HistoryView()
                }
                .font(.subheadline)
            }

            ForEach(bills.prefix(3)) { bill in
                Button {
                    selectedBill = bill
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(bill.provider)
                                .font(.headline)
                                .foregroundStyle(.primary)
                            Text(bill.billingPeriodDescription)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 4) {
                            Text(bill.totalAmount.asCurrency)
                                .font(.headline)
                                .foregroundStyle(.primary)
                            Text(bill.totalKWh.asKWh)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .cardStyle()
                }
            }
        }
    }
}
