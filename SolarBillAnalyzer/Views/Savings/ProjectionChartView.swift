import SwiftUI
import Charts

struct ProjectionChartView: View {
    let projections: [SavingsProjection]
    @State private var selectedYear: Int?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                cumulativeSavingsChart
                annualCostComparisonChart
                productionChart
                projectionTable
            }
            .padding()
        }
        .navigationTitle("25-Year Projection")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var cumulativeSavingsChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cumulative Savings")
                .font(.headline)

            Text("Net savings after accounting for system cost")
                .font(.caption)
                .foregroundStyle(.secondary)

            Chart(projections) { p in
                LineMark(
                    x: .value("Year", p.year),
                    y: .value("Savings", p.cumulativeSavings)
                )
                .foregroundStyle(AppColors.solarGreen)
                .lineStyle(StrokeStyle(lineWidth: 2.5))

                AreaMark(
                    x: .value("Year", p.year),
                    y: .value("Savings", p.cumulativeSavings)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [AppColors.solarGreen.opacity(0.3), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )

                // Break-even line
                RuleMark(y: .value("Break Even", 0))
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [5]))
                    .foregroundStyle(.secondary)
            }
            .frame(height: 220)
            .chartXAxisLabel("Year")
            .chartYAxisLabel("Savings ($)")
            .chartYAxis {
                AxisMarks(format: .currency(code: "USD").precision(.fractionLength(0)))
            }

            // Break-even annotation
            if let breakEven = projections.first(where: { $0.cumulativeSavings >= 0 && $0.year > 0 }) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text("Break even in year \(breakEven.year)")
                        .font(.subheadline.bold())
                }
            }
        }
        .cardStyle()
    }

    private var annualCostComparisonChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Annual Electricity Cost")
                .font(.headline)

            Text("Without solar vs. with solar")
                .font(.caption)
                .foregroundStyle(.secondary)

            Chart {
                ForEach(projections.filter { $0.year % 5 == 0 || $0.year == 1 }) { p in
                    BarMark(
                        x: .value("Year", "Yr \(p.year)"),
                        y: .value("Cost", p.electricityCostWithout)
                    )
                    .foregroundStyle(.red.opacity(0.7))
                    .position(by: .value("Type", "Without Solar"))

                    BarMark(
                        x: .value("Year", "Yr \(p.year)"),
                        y: .value("Cost", p.electricityCostWith)
                    )
                    .foregroundStyle(AppColors.solarGreen)
                    .position(by: .value("Type", "With Solar"))
                }
            }
            .frame(height: 200)
            .chartForegroundStyleScale([
                "Without Solar": .red.opacity(0.7),
                "With Solar": AppColors.solarGreen
            ])
        }
        .cardStyle()
    }

    private var productionChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Solar Production Over Time")
                .font(.headline)

            Text("Accounts for 1.5% annual panel degradation")
                .font(.caption)
                .foregroundStyle(.secondary)

            Chart(projections.filter { $0.year > 0 }) { p in
                LineMark(
                    x: .value("Year", p.year),
                    y: .value("Production", p.solarProduction)
                )
                .foregroundStyle(AppColors.solarOrange)

                AreaMark(
                    x: .value("Year", p.year),
                    y: .value("Production", p.solarProduction)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [AppColors.solarOrange.opacity(0.2), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            }
            .frame(height: 180)
            .chartXAxisLabel("Year")
            .chartYAxisLabel("kWh")
        }
        .cardStyle()
    }

    private var projectionTable: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Year-by-Year Details")
                .font(.headline)

            // Header
            HStack {
                Text("Year").bold().frame(width: 40, alignment: .leading)
                Text("Without").bold().frame(maxWidth: .infinity)
                Text("With").bold().frame(maxWidth: .infinity)
                Text("Savings").bold().frame(maxWidth: .infinity)
            }
            .font(.caption)
            .foregroundStyle(.secondary)

            ForEach(projections.filter { $0.year > 0 && ($0.year <= 5 || $0.year % 5 == 0) }) { p in
                HStack {
                    Text("\(p.year)").frame(width: 40, alignment: .leading)
                    Text(p.electricityCostWithout.asCurrency).frame(maxWidth: .infinity)
                    Text(p.electricityCostWith.asCurrency).frame(maxWidth: .infinity)
                    Text(p.cumulativeSavings.asCurrency)
                        .foregroundStyle(p.cumulativeSavings >= 0 ? .green : .red)
                        .frame(maxWidth: .infinity)
                }
                .font(.caption)
                Divider()
            }
        }
        .cardStyle()
    }
}
