import SwiftUI
import Charts

struct TrendChartView: View {
    let bills: [Bill]
    @State private var viewModel = HistoryViewModel()
    @State private var selectedMetric: Metric = .cost

    enum Metric: String, CaseIterable, Identifiable {
        case cost = "Cost"
        case usage = "Usage"
        case rate = "Rate"

        var id: String { rawValue }
    }

    private var trends: [HistoryViewModel.MonthlyTrend] {
        viewModel.buildTrends(from: bills)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                metricPicker
                mainChart
                statisticsSection
                monthlyDetailsSection
            }
            .padding()
        }
        .navigationTitle("Usage Trends")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var metricPicker: some View {
        Picker("Metric", selection: $selectedMetric) {
            ForEach(Metric.allCases) { metric in
                Text(metric.rawValue).tag(metric)
            }
        }
        .pickerStyle(.segmented)
    }

    private var mainChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(chartTitle)
                .font(.headline)

            if trends.count > 1 {
                Chart(trends) { trend in
                    switch selectedMetric {
                    case .cost:
                        BarMark(
                            x: .value("Month", trend.month),
                            y: .value("Amount", trend.amount)
                        )
                        .foregroundStyle(AppColors.solarBlue.gradient)
                        .cornerRadius(4)

                    case .usage:
                        BarMark(
                            x: .value("Month", trend.month),
                            y: .value("kWh", trend.kWh)
                        )
                        .foregroundStyle(AppColors.solarOrange.gradient)
                        .cornerRadius(4)

                    case .rate:
                        LineMark(
                            x: .value("Month", trend.month),
                            y: .value("Rate", trend.costPerKWh)
                        )
                        .foregroundStyle(AppColors.solarGreen)
                        .lineStyle(StrokeStyle(lineWidth: 2.5))
                        .symbol(.circle)

                        PointMark(
                            x: .value("Month", trend.month),
                            y: .value("Rate", trend.costPerKWh)
                        )
                        .foregroundStyle(AppColors.solarGreen)
                    }
                }
                .frame(height: 250)
                .chartYAxis {
                    AxisMarks { value in
                        AxisGridLine()
                        AxisValueLabel {
                            if let v = value.as(Double.self) {
                                switch selectedMetric {
                                case .cost:
                                    Text(v.asCurrency)
                                case .usage:
                                    Text("\(Int(v)) kWh")
                                case .rate:
                                    Text(String(format: "$%.3f", v))
                                }
                            }
                        }
                    }
                }
            } else {
                Text("Add more bills to see trends over time")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, minHeight: 100)
            }
        }
        .cardStyle()
    }

    private var chartTitle: String {
        switch selectedMetric {
        case .cost: return "Monthly Cost"
        case .usage: return "Monthly Usage (kWh)"
        case .rate: return "Effective Rate ($/kWh)"
        }
    }

    private var statisticsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Statistics")
                .font(.headline)

            HStack(spacing: 12) {
                statCard(title: "Total Spent", value: viewModel.totalSpent(from: bills).asCurrency)
                statCard(title: "Total Usage", value: String(format: "%.0f kWh", viewModel.totalUsage(from: bills)))
            }
            HStack(spacing: 12) {
                statCard(title: "Avg Monthly", value: viewModel.averageBill(from: bills).asCurrency)
                statCard(title: "Avg Usage", value: String(format: "%.0f kWh", viewModel.averageUsage(from: bills)))
            }

            if let highBill = bills.max(by: { $0.totalAmount < $1.totalAmount }) {
                HStack {
                    Image(systemName: "arrow.up.circle.fill")
                        .foregroundStyle(.red)
                    Text("Highest: \(highBill.totalAmount.asCurrency) (\(highBill.billingPeriodStart.monthName))")
                        .font(.caption)
                }
            }

            if let lowBill = bills.min(by: { $0.totalAmount < $1.totalAmount }) {
                HStack {
                    Image(systemName: "arrow.down.circle.fill")
                        .foregroundStyle(.green)
                    Text("Lowest: \(lowBill.totalAmount.asCurrency) (\(lowBill.billingPeriodStart.monthName))")
                        .font(.caption)
                }
            }
        }
        .cardStyle()
    }

    private func statCard(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.subheadline.bold())
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(UIColor.tertiarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private var monthlyDetailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Monthly Breakdown")
                .font(.headline)

            ForEach(trends) { trend in
                HStack {
                    Text(trend.month)
                        .font(.subheadline)
                        .frame(width: 80, alignment: .leading)
                    Spacer()
                    Text(trend.amount.asCurrency)
                        .font(.subheadline)
                        .frame(width: 80, alignment: .trailing)
                    Text(trend.kWh.asKWh)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(width: 80, alignment: .trailing)
                }
                Divider()
            }
        }
        .cardStyle()
    }
}
