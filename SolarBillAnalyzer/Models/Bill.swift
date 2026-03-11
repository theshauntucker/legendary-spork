import Foundation
import SwiftData

enum BillInputMethod: String, Codable {
    case scan
    case manual
}

enum ChargeCategory: String, Codable, CaseIterable, Identifiable {
    case baseCharge = "Base Charge"
    case energyUsage = "Energy Usage"
    case delivery = "Delivery"
    case taxes = "Taxes"
    case fees = "Fees"
    case other = "Other"

    var id: String { rawValue }

    var iconName: String {
        switch self {
        case .baseCharge: return "bolt.circle"
        case .energyUsage: return "flame"
        case .delivery: return "shippingbox"
        case .taxes: return "building.columns"
        case .fees: return "dollarsign.circle"
        case .other: return "ellipsis.circle"
        }
    }
}

@Model
final class Bill {
    var id: UUID
    var provider: String
    var billingPeriodStart: Date
    var billingPeriodEnd: Date
    var totalAmount: Double
    var totalKWh: Double
    @Relationship(deleteRule: .cascade) var lineItems: [BillLineItem]
    var address: String
    var inputMethod: BillInputMethod
    var createdAt: Date

    init(
        id: UUID = UUID(),
        provider: String,
        billingPeriodStart: Date,
        billingPeriodEnd: Date,
        totalAmount: Double,
        totalKWh: Double,
        lineItems: [BillLineItem] = [],
        address: String = "",
        inputMethod: BillInputMethod = .manual,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.provider = provider
        self.billingPeriodStart = billingPeriodStart
        self.billingPeriodEnd = billingPeriodEnd
        self.totalAmount = totalAmount
        self.totalKWh = totalKWh
        self.lineItems = lineItems
        self.address = address
        self.inputMethod = inputMethod
        self.createdAt = createdAt
    }

    var billingPeriodDescription: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return "\(formatter.string(from: billingPeriodStart)) - \(formatter.string(from: billingPeriodEnd))"
    }

    var averageDailyUsage: Double {
        let days = Calendar.current.dateComponents([.day], from: billingPeriodStart, to: billingPeriodEnd).day ?? 30
        return days > 0 ? totalKWh / Double(days) : 0
    }

    var costPerKWh: Double {
        totalKWh > 0 ? totalAmount / totalKWh : 0
    }
}
