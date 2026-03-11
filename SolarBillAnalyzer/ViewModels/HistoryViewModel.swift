import Foundation
import SwiftData

@Observable
final class HistoryViewModel {
    struct MonthlyTrend: Identifiable {
        let id = UUID()
        let month: String
        let date: Date
        let amount: Double
        let kWh: Double
        let costPerKWh: Double
    }

    func buildTrends(from bills: [Bill]) -> [MonthlyTrend] {
        let sorted = bills.sorted { $0.billingPeriodStart < $1.billingPeriodStart }
        return sorted.map { bill in
            MonthlyTrend(
                month: bill.billingPeriodStart.monthYear,
                date: bill.billingPeriodStart,
                amount: bill.totalAmount,
                kWh: bill.totalKWh,
                costPerKWh: bill.costPerKWh
            )
        }
    }

    func averageBill(from bills: [Bill]) -> Double {
        guard !bills.isEmpty else { return 0 }
        return bills.reduce(0) { $0 + $1.totalAmount } / Double(bills.count)
    }

    func averageUsage(from bills: [Bill]) -> Double {
        guard !bills.isEmpty else { return 0 }
        return bills.reduce(0) { $0 + $1.totalKWh } / Double(bills.count)
    }

    func monthOverMonthChange(from bills: [Bill]) -> (amountChange: Double, kWhChange: Double)? {
        let sorted = bills.sorted { $0.billingPeriodStart > $1.billingPeriodStart }
        guard sorted.count >= 2 else { return nil }

        let current = sorted[0]
        let previous = sorted[1]

        let amountChange = previous.totalAmount > 0
            ? (current.totalAmount - previous.totalAmount) / previous.totalAmount
            : 0
        let kWhChange = previous.totalKWh > 0
            ? (current.totalKWh - previous.totalKWh) / previous.totalKWh
            : 0

        return (amountChange, kWhChange)
    }

    func totalSpent(from bills: [Bill]) -> Double {
        bills.reduce(0) { $0 + $1.totalAmount }
    }

    func totalUsage(from bills: [Bill]) -> Double {
        bills.reduce(0) { $0 + $1.totalKWh }
    }
}
