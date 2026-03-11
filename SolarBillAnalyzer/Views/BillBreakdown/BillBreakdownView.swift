import SwiftUI
import Charts

struct BillBreakdownView: View {
    let bill: Bill
    @State private var selectedCategory: String?

    private var viewModel: BillBreakdownViewModel {
        BillBreakdownViewModel(bill: bill)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerCard
                chartSection
                categoryBreakdown
                statsSection
            }
            .padding()
        }
        .navigationTitle("Bill Breakdown")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var headerCard: some View {
        VStack(spacing: 8) {
            Text(bill.provider)
                .font(.headline)
                .foregroundStyle(.secondary)

            Text(bill.totalAmount.asCurrency)
                .font(.system(size: 44, weight: .bold, design: .rounded))

            Text(bill.billingPeriodDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 24) {
                VStack {
                    Text(bill.totalKWh.asKWh)
                        .font(.headline)
                    Text("Usage")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Divider().frame(height: 30)
                VStack {
                    Text(String(format: "$%.4f", bill.costPerKWh))
                        .font(.headline)
                    Text("Per kWh")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Divider().frame(height: 30)
                VStack {
                    Text(String(format: "%.1f", bill.averageDailyUsage))
                        .font(.headline)
                    Text("kWh/Day")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.top, 8)
        }
        .cardStyle()
    }

    private var chartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cost Distribution")
                .font(.title3.bold())

            Chart(viewModel.chartData) { data in
                SectorMark(
                    angle: .value("Amount", data.amount),
                    innerRadius: .ratio(0.6),
                    angularInset: 2
                )
                .foregroundStyle(data.color)
                .cornerRadius(4)
                .opacity(selectedCategory == nil || selectedCategory == data.category ? 1.0 : 0.4)
            }
            .frame(height: 220)
            .chartBackground { _ in
                VStack {
                    if let selected = selectedCategory,
                       let data = viewModel.chartData.first(where: { $0.category == selected }) {
                        Text(data.category)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(data.amount.asCurrency)
                            .font(.title3.bold())
                    } else {
                        Text("Total")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(bill.totalAmount.asCurrency)
                            .font(.title3.bold())
                    }
                }
            }

            // Legend
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(viewModel.chartData) { data in
                    Button {
                        withAnimation {
                            selectedCategory = selectedCategory == data.category ? nil : data.category
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(data.color)
                                .frame(width: 10, height: 10)
                            Text(data.category)
                                .font(.caption)
                                .foregroundStyle(.primary)
                            Spacer()
                            Text(data.percentage.asPercentage)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .cardStyle()
    }

    private var categoryBreakdown: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Detailed Charges")
                .font(.title3.bold())

            ForEach(viewModel.lineItemsByCategory, id: \.category) { group in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: group.category.iconName)
                            .foregroundStyle(AppColors.solarBlue)
                        Text(group.category.rawValue)
                            .font(.headline)
                        Spacer()
                        Text(group.total.asCurrency)
                            .font(.headline)
                    }

                    ForEach(group.items) { item in
                        HStack {
                            Text(item.itemDescription)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(item.amount.asCurrency)
                                .font(.subheadline)
                        }
                        .padding(.leading, 28)
                    }
                }
                .padding(.vertical, 4)

                if group.category != viewModel.lineItemsByCategory.last?.category {
                    Divider()
                }
            }
        }
        .cardStyle()
    }

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Projections")
                .font(.title3.bold())

            HStack {
                statBox(title: "Daily Avg", value: viewModel.dailyAverageCost.asCurrency, icon: "calendar")
                statBox(title: "Annual Est.", value: viewModel.projectedAnnualCost.asCompactCurrency, icon: "chart.line.uptrend.xyaxis")
            }
            HStack {
                statBox(title: "Annual Usage", value: String(format: "%.0f kWh", viewModel.projectedAnnualUsage), icon: "bolt")
                statBox(title: "Eff. Rate", value: String(format: "$%.4f", bill.costPerKWh), icon: "dollarsign.circle")
            }
        }
        .cardStyle()
    }

    private func statBox(title: String, value: String, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(AppColors.solarOrange)
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(UIColor.tertiarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
