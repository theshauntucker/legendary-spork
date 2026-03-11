import SwiftUI
import SwiftData

struct ProviderListView: View {
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @State private var viewModel = ProviderComparisonViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                usageInput
                if viewModel.potentialSavings > 0 {
                    savingsBanner
                }
                filterBar
                providerList
            }
            .padding()
        }
        .navigationTitle("Compare Providers")
        .onAppear {
            viewModel.loadData()
            if let bill = bills.first {
                viewModel.userMonthlyKWh = bill.totalKWh
            }
        }
    }

    private var usageInput: some View {
        HStack {
            Text("Your Monthly Usage:")
                .font(.subheadline)
            Spacer()
            Text("\(Int(viewModel.userMonthlyKWh)) kWh")
                .font(.subheadline.bold())
        }
        .cardStyle()
    }

    private var savingsBanner: some View {
        VStack(spacing: 8) {
            Text("You could save up to")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("\(viewModel.potentialSavings.asCurrency)/month")
                .font(.title.bold())
                .foregroundStyle(AppColors.solarGreen)
            Text("by switching providers")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(AppColors.solarGreen.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var filterBar: some View {
        VStack(spacing: 12) {
            Picker("Sort By", selection: $viewModel.sortOption) {
                ForEach(ProviderComparisonViewModel.SortOption.allCases) { option in
                    Text(option.rawValue).tag(option)
                }
            }
            .pickerStyle(.segmented)

            Toggle("Renewable Only", isOn: $viewModel.filterRenewable)
                .font(.subheadline)
        }
    }

    private var providerList: some View {
        VStack(spacing: 12) {
            ForEach(viewModel.filteredProviders) { provider in
                providerCard(provider)
            }
        }
    }

    private func providerCard(_ provider: EnergyProvider) -> some View {
        let monthlyCost = provider.estimatedMonthlyCost(forKWh: viewModel.userMonthlyKWh)
        let isCheapest = provider.id == viewModel.cheapestProvider?.id

        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(provider.name)
                            .font(.headline)
                        if provider.isRenewable {
                            Image(systemName: "leaf.fill")
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }
                    Text(provider.planName)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if isCheapest {
                    Text("Best Price")
                        .font(.caption2.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(AppColors.solarGreen.opacity(0.15))
                        .foregroundStyle(AppColors.solarGreen)
                        .clipShape(Capsule())
                }
            }

            HStack(spacing: 24) {
                VStack {
                    Text(monthlyCost.asCurrency)
                        .font(.title3.bold())
                        .foregroundStyle(isCheapest ? AppColors.solarGreen : .primary)
                    Text("Est. Monthly")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                VStack {
                    Text(provider.formattedRate)
                        .font(.subheadline.bold())
                    Text("Rate")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                VStack {
                    Text(provider.formattedBaseCharge)
                        .font(.subheadline.bold())
                    Text("Base")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                VStack {
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundStyle(.yellow)
                        Text(String(format: "%.1f", provider.rating))
                            .font(.subheadline.bold())
                    }
                    Text("Rating")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .cardStyle()
    }
}
