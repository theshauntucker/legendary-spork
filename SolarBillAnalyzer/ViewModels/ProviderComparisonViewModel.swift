import Foundation

@Observable
final class ProviderComparisonViewModel {
    var providers: [EnergyProvider] = []
    var savingsTips: [SavingsTip] = []
    var userMonthlyKWh: Double = 900
    var sortOption: SortOption = .monthlyCost
    var filterRenewable = false
    var selectedCategory: SavingsTip.TipCategory?

    private let service: ProviderServiceProtocol = MockProviderService()

    enum SortOption: String, CaseIterable, Identifiable {
        case monthlyCost = "Monthly Cost"
        case ratePerKWh = "Rate/kWh"
        case rating = "Rating"

        var id: String { rawValue }
    }

    func loadData() {
        providers = service.getProviders()
        savingsTips = service.getSavingsTips()
    }

    var filteredProviders: [EnergyProvider] {
        var result = providers
        if filterRenewable {
            result = result.filter { $0.isRenewable }
        }

        switch sortOption {
        case .monthlyCost:
            result.sort { $0.estimatedMonthlyCost(forKWh: userMonthlyKWh) < $1.estimatedMonthlyCost(forKWh: userMonthlyKWh) }
        case .ratePerKWh:
            result.sort { $0.ratePerKWh < $1.ratePerKWh }
        case .rating:
            result.sort { $0.rating > $1.rating }
        }

        return result
    }

    var filteredTips: [SavingsTip] {
        if let category = selectedCategory {
            return savingsTips.filter { $0.category == category }
        }
        return savingsTips
    }

    var cheapestProvider: EnergyProvider? {
        providers.min { $0.estimatedMonthlyCost(forKWh: userMonthlyKWh) < $1.estimatedMonthlyCost(forKWh: userMonthlyKWh) }
    }

    var mostExpensiveProvider: EnergyProvider? {
        providers.max { $0.estimatedMonthlyCost(forKWh: userMonthlyKWh) < $1.estimatedMonthlyCost(forKWh: userMonthlyKWh) }
    }

    var potentialSavings: Double {
        guard let cheapest = cheapestProvider, let expensive = mostExpensiveProvider else { return 0 }
        return expensive.estimatedMonthlyCost(forKWh: userMonthlyKWh) - cheapest.estimatedMonthlyCost(forKWh: userMonthlyKWh)
    }
}
