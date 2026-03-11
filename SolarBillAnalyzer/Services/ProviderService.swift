import Foundation

protocol ProviderServiceProtocol {
    func getProviders() -> [EnergyProvider]
    func getSavingsTips() -> [SavingsTip]
}

struct SavingsTip: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let estimatedSavings: String
    let difficulty: Difficulty
    let category: TipCategory
    let icon: String

    enum Difficulty: String, CaseIterable {
        case easy = "Easy"
        case moderate = "Moderate"
        case advanced = "Advanced"

        var color: String {
            switch self {
            case .easy: return "green"
            case .moderate: return "orange"
            case .advanced: return "red"
            }
        }
    }

    enum TipCategory: String, CaseIterable, Identifiable {
        case behavioral = "Behavioral"
        case appliances = "Appliances"
        case homeImprovement = "Home Improvement"
        case ratePlan = "Rate Plan"

        var id: String { rawValue }
    }
}

final class MockProviderService: ProviderServiceProtocol {
    func getProviders() -> [EnergyProvider] {
        [
            EnergyProvider(name: "SunPower Energy", planName: "Green Choice 100", ratePerKWh: 0.145, baseCharge: 8.50, isRenewable: true, rating: 4.7),
            EnergyProvider(name: "Pacific Gas & Electric", planName: "E-TOU-C", ratePerKWh: 0.210, baseCharge: 10.00, isRenewable: false, rating: 3.2),
            EnergyProvider(name: "Clean Energy Co", planName: "Solar Basic", ratePerKWh: 0.160, baseCharge: 12.00, isRenewable: true, rating: 4.3),
            EnergyProvider(name: "National Grid", planName: "Value Rate", ratePerKWh: 0.185, baseCharge: 9.75, isRenewable: false, rating: 3.5),
            EnergyProvider(name: "EcoWatt", planName: "Wind & Solar 50", ratePerKWh: 0.175, baseCharge: 7.00, isRenewable: true, rating: 4.5),
            EnergyProvider(name: "Constellation", planName: "12-Month Fixed", ratePerKWh: 0.168, baseCharge: 11.50, isRenewable: false, rating: 3.8),
            EnergyProvider(name: "Green Mountain", planName: "Pollution Free", ratePerKWh: 0.155, baseCharge: 10.50, isRenewable: true, rating: 4.6),
            EnergyProvider(name: "Direct Energy", planName: "Live Brighter 24", ratePerKWh: 0.192, baseCharge: 8.00, isRenewable: false, rating: 3.4),
        ]
    }

    func getSavingsTips() -> [SavingsTip] {
        [
            SavingsTip(title: "Switch to LED Bulbs", description: "Replace incandescent and CFL bulbs with LED. LEDs use up to 75% less energy and last 25 times longer.", estimatedSavings: "$75-150/year", difficulty: .easy, category: .appliances, icon: "lightbulb.fill"),
            SavingsTip(title: "Adjust Your Thermostat", description: "Set your thermostat 7-10°F lower in winter and higher in summer while you're asleep or away. A programmable thermostat automates this.", estimatedSavings: "$100-200/year", difficulty: .easy, category: .behavioral, icon: "thermometer.medium"),
            SavingsTip(title: "Switch to Time-of-Use Plan", description: "If your utility offers TOU rates, shift heavy usage to off-peak hours (evenings and weekends) to pay lower rates.", estimatedSavings: "$50-150/year", difficulty: .moderate, category: .ratePlan, icon: "clock.fill"),
            SavingsTip(title: "Seal Air Leaks", description: "Caulk and weatherstrip around doors and windows. Air leaks can account for 25-30% of heating and cooling costs.", estimatedSavings: "$100-250/year", difficulty: .moderate, category: .homeImprovement, icon: "wind"),
            SavingsTip(title: "Use Smart Power Strips", description: "Standby power from electronics can cost $100/year. Smart power strips cut power to devices that are off or in standby.", estimatedSavings: "$50-100/year", difficulty: .easy, category: .appliances, icon: "powerplug.fill"),
            SavingsTip(title: "Upgrade to ENERGY STAR", description: "When replacing appliances, choose ENERGY STAR certified models. They use 10-50% less energy than standard models.", estimatedSavings: "$100-400/year", difficulty: .advanced, category: .appliances, icon: "star.fill"),
            SavingsTip(title: "Insulate Your Home", description: "Adding insulation to your attic, walls, and floors reduces heating and cooling energy usage by up to 20%.", estimatedSavings: "$200-500/year", difficulty: .advanced, category: .homeImprovement, icon: "house.fill"),
            SavingsTip(title: "Wash Clothes in Cold Water", description: "About 90% of the energy used by a washing machine goes to heating water. Cold water works just as well for most loads.", estimatedSavings: "$50-75/year", difficulty: .easy, category: .behavioral, icon: "washer.fill"),
            SavingsTip(title: "Install a Smart Thermostat", description: "Smart thermostats learn your schedule and adjust temperatures automatically, saving 10-15% on heating and cooling.", estimatedSavings: "$150-200/year", difficulty: .moderate, category: .appliances, icon: "gear"),
            SavingsTip(title: "Negotiate Your Rate", description: "In deregulated markets, you can shop for electricity providers. Compare rates and negotiate for better pricing.", estimatedSavings: "$100-300/year", difficulty: .moderate, category: .ratePlan, icon: "phone.fill"),
        ]
    }
}
