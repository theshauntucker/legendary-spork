import SwiftUI
import SwiftData

struct SavingsCalculatorView: View {
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @Query(sort: \SolarProfile.lastCalculated, order: .reverse) private var profiles: [SolarProfile]
    @State private var viewModel = SavingsViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                inputSection
                calculateButton

                if viewModel.hasCalculated {
                    savingsSummaryCards
                    NavigationLink("View 25-Year Projection") {
                        ProjectionChartView(projections: viewModel.projections)
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppColors.solarBlue.opacity(0.1))
                    .foregroundStyle(AppColors.solarBlue)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    NavigationLink("Compare Financing Options") {
                        FinancingComparisonView(options: viewModel.financingOptions, monthlyBill: Double(viewModel.monthlyBill) ?? 180)
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppColors.solarGreen.opacity(0.1))
                    .foregroundStyle(AppColors.solarGreen)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    systemCostBreakdown
                }
            }
            .padding()
        }
        .navigationTitle("Savings Calculator")
        .onAppear {
            if let bill = bills.first {
                viewModel.loadFromBill(bill)
            }
            if let profile = profiles.first {
                viewModel.loadFromSolarProfile(profile)
            }
        }
    }

    private var inputSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Your Energy Profile")
                .font(.headline)

            LabeledContent("Monthly Bill") {
                HStack {
                    Text("$")
                    TextField("180", text: $viewModel.monthlyBill)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
            }

            LabeledContent("Monthly Usage") {
                HStack {
                    TextField("900", text: $viewModel.monthlyKWh)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                    Text("kWh")
                        .foregroundStyle(.secondary)
                }
            }

            LabeledContent("Rate per kWh") {
                HStack {
                    Text("$")
                    TextField("0.20", text: $viewModel.ratePerKWh)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80)
                }
            }

            Divider()

            HStack {
                LabeledContent("System Size") {
                    HStack {
                        TextField("8.0", text: $viewModel.systemSizeKW)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("kW")
                            .foregroundStyle(.secondary)
                    }
                }

                Button("Auto") {
                    viewModel.autoSizeSystem()
                }
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(AppColors.solarBlue.opacity(0.15))
                .foregroundStyle(AppColors.solarBlue)
                .clipShape(Capsule())
            }
        }
        .cardStyle()
    }

    private var calculateButton: some View {
        Button {
            viewModel.calculate()
        } label: {
            Label("Calculate Savings", systemImage: "chart.line.uptrend.xyaxis")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(AppColors.solarOrange)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var savingsSummaryCards: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                summaryCard(
                    title: "Monthly Savings",
                    value: viewModel.monthlySavings.asCurrency,
                    subtitle: "Estimated",
                    icon: "dollarsign.circle.fill",
                    color: AppColors.solarGreen
                )
                summaryCard(
                    title: "Annual Savings",
                    value: viewModel.annualSavings.asCurrency,
                    subtitle: "Year 1",
                    icon: "chart.bar.fill",
                    color: AppColors.solarBlue
                )
            }
            HStack(spacing: 12) {
                summaryCard(
                    title: "Payback Period",
                    value: String(format: "%.1f yrs", viewModel.paybackPeriod),
                    subtitle: "Cash purchase",
                    icon: "clock.fill",
                    color: AppColors.solarOrange
                )
                summaryCard(
                    title: "25-Year Savings",
                    value: viewModel.totalSavings25Year.asCompactCurrency,
                    subtitle: "Net savings",
                    icon: "star.fill",
                    color: .purple
                )
            }
        }
    }

    private func summaryCard(title: String, value: String, subtitle: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title3.bold())
            Text(title)
                .font(.caption.bold())
            Text(subtitle)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var systemCostBreakdown: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("System Cost Breakdown")
                .font(.headline)

            LabeledContent("Gross System Cost") {
                Text(viewModel.systemCost.asCurrency)
            }

            LabeledContent("Federal Tax Credit (30%)") {
                Text("-\(viewModel.federalTaxCredit.asCurrency)")
                    .foregroundStyle(.green)
            }

            Divider()

            LabeledContent("Net Cost") {
                Text(viewModel.netSystemCost.asCurrency)
                    .bold()
            }

            Text("Based on $\(String(format: "%.2f", AppConstants.costPerWattInstalled))/watt installed. Actual costs vary by installer and location.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .cardStyle()
    }
}
