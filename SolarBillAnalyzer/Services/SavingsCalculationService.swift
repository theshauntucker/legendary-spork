import Foundation

struct SavingsProjection: Identifiable {
    let id = UUID()
    let year: Int
    let electricityCostWithout: Double
    let electricityCostWith: Double
    let cumulativeSavings: Double
    let solarProduction: Double
    let netSavings: Double
}

struct FinancingOption: Identifiable {
    let id = UUID()
    let type: FinancingType
    let upfrontCost: Double
    let monthlyPayment: Double
    let totalCost: Double
    let totalSavings: Double
    let paybackYears: Double
    let netSavings25Year: Double

    enum FinancingType: String, CaseIterable, Identifiable {
        case cash = "Cash Purchase"
        case loan = "Solar Loan"
        case lease = "Solar Lease"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .cash: return "banknote"
            case .loan: return "creditcard"
            case .lease: return "doc.text"
            }
        }

        var description: String {
            switch self {
            case .cash: return "Buy the system outright. Highest long-term savings."
            case .loan: return "Finance with fixed monthly payments. Own the system."
            case .lease: return "Low upfront cost. Predictable monthly payments."
            }
        }
    }
}

enum SavingsCalculationService {
    struct SavingsInput {
        var monthlyBill: Double
        var monthlyKWh: Double
        var ratePerKWh: Double
        var systemSizeKW: Double
        var annualSunHours: Double
        var roofAreaSqFt: Double
    }

    static func calculateProjections(input: SavingsInput) -> [SavingsProjection] {
        let costPerWatt = AppConstants.costPerWattInstalled
        let systemCost = input.systemSizeKW * 1000 * costPerWatt
        let federalCredit = systemCost * AppConstants.federalTaxCreditRate
        let netSystemCost = systemCost - federalCredit

        let dailyPeakHours = input.annualSunHours / 365.0
        let yearOneProduction = input.systemSizeKW * dailyPeakHours * 365 * (1 - AppConstants.systemLossFactor)

        var projections: [SavingsProjection] = []
        var cumulativeSavings = -netSystemCost  // Start negative (investment)

        for year in 0...AppConstants.systemLifetimeYears {
            let degradation = pow(1 - AppConstants.panelDegradationRate, Double(year))
            let solarProduction = yearOneProduction * degradation

            let electricityInflation = pow(1 + AppConstants.electricityInflationRate, Double(year))
            let annualBillWithout = input.monthlyBill * 12 * electricityInflation

            let kWhOffset = min(solarProduction, input.monthlyKWh * 12)
            let remainingKWh = max(0, input.monthlyKWh * 12 - kWhOffset)
            let inflatedRate = input.ratePerKWh * electricityInflation
            let annualBillWith = remainingKWh * inflatedRate

            let annualSavings = annualBillWithout - annualBillWith
            if year > 0 {
                cumulativeSavings += annualSavings
            }

            projections.append(SavingsProjection(
                year: year,
                electricityCostWithout: annualBillWithout,
                electricityCostWith: annualBillWith,
                cumulativeSavings: cumulativeSavings,
                solarProduction: solarProduction,
                netSavings: annualSavings
            ))
        }

        return projections
    }

    static func calculateFinancingOptions(input: SavingsInput) -> [FinancingOption] {
        let systemCost = input.systemSizeKW * 1000 * AppConstants.costPerWattInstalled
        let federalCredit = systemCost * AppConstants.federalTaxCreditRate

        let projections = calculateProjections(input: input)
        let totalSavingsOver25Years = projections.dropFirst().reduce(0) { $0 + $1.netSavings }

        // Cash purchase
        let cashUpfront = systemCost - federalCredit
        let cashOption = FinancingOption(
            type: .cash,
            upfrontCost: cashUpfront,
            monthlyPayment: 0,
            totalCost: cashUpfront,
            totalSavings: totalSavingsOver25Years,
            paybackYears: calculatePayback(projections: projections),
            netSavings25Year: totalSavingsOver25Years - cashUpfront
        )

        // Loan
        let loanAmount = systemCost  // Finance full amount, get tax credit as bonus
        let monthlyRate = AppConstants.defaultLoanInterestRate / 12.0
        let numPayments = Double(AppConstants.defaultLoanTermYears * 12)
        let monthlyPayment = loanAmount * (monthlyRate * pow(1 + monthlyRate, numPayments)) / (pow(1 + monthlyRate, numPayments) - 1)
        let totalLoanCost = monthlyPayment * numPayments - federalCredit

        let loanOption = FinancingOption(
            type: .loan,
            upfrontCost: 0,
            monthlyPayment: monthlyPayment,
            totalCost: totalLoanCost,
            totalSavings: totalSavingsOver25Years,
            paybackYears: calculatePayback(projections: projections) + 2, // Slightly longer with interest
            netSavings25Year: totalSavingsOver25Years - totalLoanCost
        )

        // Lease
        let leaseYear1Monthly = input.monthlyBill * 0.8  // Start at 80% of current bill
        var totalLeaseCost: Double = 0
        for year in 0..<AppConstants.systemLifetimeYears {
            let escalated = leaseYear1Monthly * pow(1 + AppConstants.defaultLeaseEscalator, Double(year))
            totalLeaseCost += escalated * 12
        }

        let leaseOption = FinancingOption(
            type: .lease,
            upfrontCost: 0,
            monthlyPayment: leaseYear1Monthly,
            totalCost: totalLeaseCost,
            totalSavings: totalSavingsOver25Years,
            paybackYears: 0,  // Immediate savings with lease
            netSavings25Year: totalSavingsOver25Years - totalLeaseCost
        )

        return [cashOption, loanOption, leaseOption]
    }

    private static func calculatePayback(projections: [SavingsProjection]) -> Double {
        for projection in projections {
            if projection.cumulativeSavings >= 0 && projection.year > 0 {
                // Linear interpolation for partial year
                if projection.year > 1 {
                    let prev = projections[projection.year - 1]
                    let fraction = abs(prev.cumulativeSavings) / projection.netSavings
                    return Double(projection.year - 1) + fraction
                }
                return Double(projection.year)
            }
        }
        return Double(AppConstants.systemLifetimeYears)
    }

    static func estimateSystemSize(monthlyKWh: Double, annualSunHours: Double) -> Double {
        let dailyPeakHours = annualSunHours / 365.0
        guard dailyPeakHours > 0 else { return 5.0 }

        let annualKWh = monthlyKWh * 12
        let systemSize = annualKWh / (dailyPeakHours * 365 * (1 - AppConstants.systemLossFactor))
        return min(max(systemSize, 2.0), 15.0)  // Clamp between 2-15 kW
    }
}
