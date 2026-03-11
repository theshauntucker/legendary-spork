import Foundation
import SwiftData

@Observable
final class SavingsViewModel {
    var monthlyBill: String = "180"
    var monthlyKWh: String = "900"
    var ratePerKWh: String = "0.20"
    var systemSizeKW: String = "8.0"
    var annualSunHours: Double = 2200
    var roofAreaSqFt: String = "1500"

    var projections: [SavingsProjection] = []
    var financingOptions: [FinancingOption] = []
    var hasCalculated = false

    var input: SavingsCalculationService.SavingsInput {
        SavingsCalculationService.SavingsInput(
            monthlyBill: Double(monthlyBill) ?? 180,
            monthlyKWh: Double(monthlyKWh) ?? 900,
            ratePerKWh: Double(ratePerKWh) ?? 0.20,
            systemSizeKW: Double(systemSizeKW) ?? 8.0,
            annualSunHours: annualSunHours,
            roofAreaSqFt: Double(roofAreaSqFt) ?? 1500
        )
    }

    var systemCost: Double {
        (Double(systemSizeKW) ?? 8.0) * 1000 * AppConstants.costPerWattInstalled
    }

    var federalTaxCredit: Double {
        systemCost * AppConstants.federalTaxCreditRate
    }

    var netSystemCost: Double {
        systemCost - federalTaxCredit
    }

    var monthlySavings: Double {
        guard let first = projections.dropFirst().first else { return 0 }
        return first.netSavings / 12
    }

    var annualSavings: Double {
        projections.dropFirst().first?.netSavings ?? 0
    }

    var paybackPeriod: Double {
        financingOptions.first(where: { $0.type == .cash })?.paybackYears ?? 0
    }

    var totalSavings25Year: Double {
        projections.last?.cumulativeSavings ?? 0
    }

    func loadFromBill(_ bill: Bill) {
        monthlyBill = String(format: "%.0f", bill.totalAmount)
        monthlyKWh = String(format: "%.0f", bill.totalKWh)
        if bill.costPerKWh > 0 {
            ratePerKWh = String(format: "%.4f", bill.costPerKWh)
        }
    }

    func loadFromSolarProfile(_ profile: SolarProfile) {
        annualSunHours = profile.annualSunHours
        roofAreaSqFt = String(format: "%.0f", profile.roofAreaSqFt)
        systemSizeKW = String(format: "%.1f", profile.estimatedSystemSizeKW)
    }

    func autoSizeSystem() {
        let kWh = Double(monthlyKWh) ?? 900
        let size = SavingsCalculationService.estimateSystemSize(monthlyKWh: kWh, annualSunHours: annualSunHours)
        systemSizeKW = String(format: "%.1f", size)
    }

    func calculate() {
        projections = SavingsCalculationService.calculateProjections(input: input)
        financingOptions = SavingsCalculationService.calculateFinancingOptions(input: input)
        hasCalculated = true
    }
}
