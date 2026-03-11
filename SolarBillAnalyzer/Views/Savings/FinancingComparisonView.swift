import SwiftUI

struct FinancingComparisonView: View {
    let options: [FinancingOption]
    let monthlyBill: Double

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                ForEach(options) { option in
                    financingCard(option)
                }
                disclaimerSection
            }
            .padding()
        }
        .navigationTitle("Financing Options")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "chart.pie.fill")
                .font(.system(size: 36))
                .foregroundStyle(AppColors.solarBlue)

            Text("Compare Your Options")
                .font(.title2.bold())

            Text("See how different financing methods affect your savings over 25 years")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.bottom, 8)
    }

    private func financingCard(_ option: FinancingOption) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Image(systemName: option.type.icon)
                    .font(.title2)
                    .foregroundStyle(colorForType(option.type))
                VStack(alignment: .leading, spacing: 2) {
                    Text(option.type.rawValue)
                        .font(.headline)
                    Text(option.type.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }

            Divider()

            // Key metrics
            VStack(spacing: 12) {
                HStack {
                    metricLabel("Upfront Cost")
                    Spacer()
                    Text(option.upfrontCost > 0 ? option.upfrontCost.asCurrency : "None")
                        .font(.subheadline.bold())
                        .foregroundStyle(option.upfrontCost > 0 ? .primary : .green)
                }

                HStack {
                    metricLabel("Monthly Payment")
                    Spacer()
                    if option.monthlyPayment > 0 {
                        VStack(alignment: .trailing) {
                            Text(option.monthlyPayment.asCurrency)
                                .font(.subheadline.bold())
                            Text("vs \(monthlyBill.asCurrency) current bill")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    } else {
                        Text("None")
                            .font(.subheadline.bold())
                            .foregroundStyle(.green)
                    }
                }

                HStack {
                    metricLabel("Total Cost (25 yr)")
                    Spacer()
                    Text(option.totalCost.asCurrency)
                        .font(.subheadline.bold())
                }

                if option.paybackYears > 0 {
                    HStack {
                        metricLabel("Payback Period")
                        Spacer()
                        Text(String(format: "%.1f years", option.paybackYears))
                            .font(.subheadline.bold())
                    }
                }

                Divider()

                HStack {
                    metricLabel("Net Savings (25 yr)")
                    Spacer()
                    Text(option.netSavings25Year.asCurrency)
                        .font(.title3.bold())
                        .foregroundStyle(option.netSavings25Year > 0 ? .green : .red)
                }
            }

            // Recommendation badge
            if option.type == bestOption?.type {
                HStack {
                    Image(systemName: "star.fill")
                        .foregroundStyle(.yellow)
                    Text("Best Value")
                        .font(.caption.bold())
                        .foregroundStyle(AppColors.solarBlue)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(AppColors.solarBlue.opacity(0.1))
                .clipShape(Capsule())
            }
        }
        .cardStyle()
    }

    private var bestOption: FinancingOption? {
        options.max(by: { $0.netSavings25Year < $1.netSavings25Year })
    }

    private func metricLabel(_ text: String) -> some View {
        Text(text)
            .font(.subheadline)
            .foregroundStyle(.secondary)
    }

    private func colorForType(_ type: FinancingOption.FinancingType) -> Color {
        switch type {
        case .cash: return AppColors.solarGreen
        case .loan: return AppColors.solarBlue
        case .lease: return AppColors.solarOrange
        }
    }

    private var disclaimerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Important Notes")
                .font(.caption.bold())

            Text("""
            • Projections are estimates based on industry averages and may vary
            • Federal tax credit of 30% (ITC) assumed for 2024-2032
            • Electricity inflation rate: 3% annually
            • Panel degradation: 1.5% per year
            • Loan terms: \(AppConstants.defaultLoanTermYears)-year fixed at \(String(format: "%.1f%%", AppConstants.defaultLoanInterestRate * 100))
            • Lease escalator: \(String(format: "%.1f%%", AppConstants.defaultLeaseEscalator * 100)) annually
            • Consult a solar professional for accurate quotes
            """)
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .cardStyle()
    }
}
