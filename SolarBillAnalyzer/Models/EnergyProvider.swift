import Foundation

struct EnergyProvider: Identifiable, Hashable {
    var id: UUID = UUID()
    var name: String
    var planName: String
    var ratePerKWh: Double
    var baseCharge: Double
    var isRenewable: Bool
    var rating: Double

    var formattedRate: String {
        String(format: "$%.4f/kWh", ratePerKWh)
    }

    var formattedBaseCharge: String {
        String(format: "$%.2f/mo", baseCharge)
    }

    func estimatedMonthlyCost(forKWh kWh: Double) -> Double {
        baseCharge + (ratePerKWh * kWh)
    }
}
