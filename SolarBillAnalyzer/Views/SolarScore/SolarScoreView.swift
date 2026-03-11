import SwiftUI
import SwiftData

struct SolarScoreView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = SolarScoreViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                addressSection
                roofAreaSection
                calculateButton

                if viewModel.isCalculating {
                    calculatingView
                }

                if let result = viewModel.scoreResult {
                    scoreResultView(result)
                }

                if let error = viewModel.errorMessage {
                    errorView(error)
                }
            }
            .padding()
        }
        .navigationTitle("Solar Score")
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "sun.max.fill")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.solarOrange)
            Text("Discover Your Solar Potential")
                .font(.title2.bold())
            Text("Enter your address to get a personalized solar score based on your location, climate, and roof size.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.bottom, 8)
    }

    private var addressSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Your Address")
                .font(.headline)

            AddressSearchView(
                addressQuery: $viewModel.addressQuery,
                searchResults: viewModel.searchResults,
                onQueryChanged: { viewModel.startAddressSearch() },
                onResultSelected: { result in
                    Task { await viewModel.selectSearchResult(result) }
                }
            )

            if let address = viewModel.selectedAddress {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text(address.fullAddress)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 4)
            }
        }
    }

    private var roofAreaSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Estimated Roof Area")
                .font(.headline)

            HStack {
                TextField("1500", text: $viewModel.roofAreaSqFt)
                    .keyboardType(.numberPad)
                    .padding(12)
                    .background(Color(UIColor.secondarySystemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .frame(width: 120)

                Text("sq ft")
                    .foregroundStyle(.secondary)

                Spacer()
            }

            Text("Average US home has 1,500-2,500 sq ft of roof area")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var calculateButton: some View {
        Button {
            viewModel.calculateScore()
        } label: {
            Label(
                viewModel.hasCalculated ? "Recalculate Score" : "Calculate Solar Score",
                systemImage: "sun.max.fill"
            )
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(viewModel.selectedAddress != nil ? AppColors.solarOrange : Color.secondary.opacity(0.3))
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(viewModel.selectedAddress == nil || viewModel.isCalculating)
    }

    private var calculatingView: some View {
        VStack(spacing: 12) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Analyzing solar potential...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 20)
    }

    private func scoreResultView(_ result: SolarScoreResult) -> some View {
        VStack(spacing: 20) {
            // Score gauge
            SolarScoreGaugeView(score: result.score)
                .padding(.vertical, 16)

            // Key metrics
            HStack(spacing: 16) {
                metricCard(title: "System Size", value: String(format: "%.1f kW", result.estimatedSystemSizeKW), icon: "bolt.fill")
                metricCard(title: "Sun Hours", value: String(format: "%.0f/yr", result.annualSunHours), icon: "sun.max.fill")
                metricCard(title: "Production", value: String(format: "%.0f kWh", result.estimatedAnnualProduction), icon: "chart.bar.fill")
            }

            // Scoring factors
            VStack(alignment: .leading, spacing: 12) {
                Text("Scoring Breakdown")
                    .font(.headline)

                ForEach(result.factors) { factor in
                    factorRow(factor)
                }
            }
            .cardStyle()

            // Save button
            Button {
                if let profile = viewModel.createSolarProfile() {
                    modelContext.insert(profile)
                }
            } label: {
                Label("Save Solar Profile", systemImage: "square.and.arrow.down")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppColors.solarGreen)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            // CTA
            NavigationLink {
                SavingsCalculatorView()
            } label: {
                HStack {
                    Image(systemName: "dollarsign.circle.fill")
                        .font(.title2)
                        .foregroundStyle(AppColors.solarGreen)
                    VStack(alignment: .leading) {
                        Text("See Your Savings")
                            .font(.headline)
                        Text("Calculate how much you could save with solar")
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
    }

    private func metricCard(title: String, value: String, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(AppColors.solarOrange)
            Text(value)
                .font(.subheadline.bold())
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(AppColors.solarOrange.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func factorRow(_ factor: ScoringFactor) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(factor.name)
                    .font(.subheadline.bold())
                Spacer()
                Text(factor.score >= 0 ? "+\(Int(factor.score))" : "\(Int(factor.score))")
                    .font(.subheadline.bold())
                    .foregroundStyle(factor.score >= 0 ? .green : .red)
            }

            if factor.score >= 0 {
                ProgressView(value: factor.score, total: factor.maxScore)
                    .tint(factor.score / factor.maxScore > 0.7 ? .green : .orange)
            }

            Text(factor.description)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }

    private func errorView(_ message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)
            Text(message)
                .font(.subheadline)
        }
        .cardStyle()
    }
}
