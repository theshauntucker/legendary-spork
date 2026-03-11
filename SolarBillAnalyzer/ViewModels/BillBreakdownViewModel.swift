import Foundation
import SwiftUI

@Observable
final class BillBreakdownViewModel {
    var bill: Bill

    init(bill: Bill) {
        self.bill = bill
    }

    struct ChartData: Identifiable {
        var id: String { category }
        var category: String
        var amount: Double
        var color: Color
        var percentage: Double
    }

    var chartData: [ChartData] {
        let grouped = Dictionary(grouping: bill.lineItems) { $0.category }
        let sorted = grouped.sorted { first, second in
            let firstTotal = first.value.reduce(0) { $0 + $1.amount }
            let secondTotal = second.value.reduce(0) { $0 + $1.amount }
            return firstTotal > secondTotal
        }

        return sorted.enumerated().map { index, entry in
            let total = entry.value.reduce(0) { $0 + $1.amount }
            let colorIndex = index % AppColors.chartColors.count
            return ChartData(
                category: entry.key.rawValue,
                amount: total,
                color: AppColors.chartColors[colorIndex],
                percentage: bill.totalAmount > 0 ? total / bill.totalAmount : 0
            )
        }
    }

    var lineItemsByCategory: [(category: ChargeCategory, items: [BillLineItem], total: Double)] {
        let grouped = Dictionary(grouping: bill.lineItems) { $0.category }
        return ChargeCategory.allCases.compactMap { category in
            guard let items = grouped[category], !items.isEmpty else { return nil }
            let total = items.reduce(0) { $0 + $1.amount }
            return (category: category, items: items, total: total)
        }
    }

    var dailyAverageCost: Double {
        let days = Calendar.current.dateComponents([.day], from: bill.billingPeriodStart, to: bill.billingPeriodEnd).day ?? 30
        return days > 0 ? bill.totalAmount / Double(days) : 0
    }

    var projectedAnnualCost: Double {
        dailyAverageCost * 365
    }

    var projectedAnnualUsage: Double {
        bill.averageDailyUsage * 365
    }
}
