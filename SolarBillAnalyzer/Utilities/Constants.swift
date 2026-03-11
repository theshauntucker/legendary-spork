import SwiftUI

enum AppColors {
    static let primary = Color("Primary", bundle: nil)
    static let secondary = Color("Secondary", bundle: nil)
    static let accent = Color("Accent", bundle: nil)

    // Fallback colors when asset catalog colors aren't available
    static let solarOrange = Color(red: 1.0, green: 0.6, blue: 0.0)
    static let solarYellow = Color(red: 1.0, green: 0.84, blue: 0.0)
    static let solarBlue = Color(red: 0.0, green: 0.47, blue: 0.84)
    static let solarGreen = Color(red: 0.2, green: 0.78, blue: 0.35)
    static let backgroundPrimary = Color(UIColor.systemBackground)
    static let backgroundSecondary = Color(UIColor.secondarySystemBackground)
    static let cardBackground = Color(UIColor.secondarySystemGroupedBackground)

    static let scoreExcellent = Color.green
    static let scoreGood = Color(red: 0.4, green: 0.8, blue: 0.2)
    static let scoreFair = Color.yellow
    static let scoreBelowAverage = Color.orange
    static let scorePoor = Color.red

    static let chartColors: [Color] = [
        .blue, .orange, .green, .red, .purple, .cyan
    ]
}

enum AppConstants {
    static let appName = "SolarBill Analyzer"
    static let appVersion = "1.0.0"

    // Solar calculation defaults
    static let costPerWattInstalled: Double = 3.00
    static let panelDegradationRate: Double = 0.015  // 1.5% per year
    static let electricityInflationRate: Double = 0.03  // 3% per year
    static let systemLifetimeYears: Int = 25
    static let federalTaxCreditRate: Double = 0.30  // 30% ITC
    static let averageSunHoursUS: Double = 4.5  // peak sun hours/day
    static let panelEfficiency: Double = 0.20  // 20%
    static let systemLossFactor: Double = 0.14  // 14% system losses

    // Loan defaults
    static let defaultLoanTermYears: Int = 10
    static let defaultLoanInterestRate: Double = 0.065  // 6.5%
    static let defaultLeaseEscalator: Double = 0.029  // 2.9%/year

    // Notification identifiers
    static let billReminderNotificationID = "bill_reminder"
    static let usageSpikeNotificationID = "usage_spike"
    static let savingsMilestoneNotificationID = "savings_milestone"
}
