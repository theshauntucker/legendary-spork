import Foundation
import SwiftData
import SwiftUI

@Observable
final class BillInputViewModel {
    var provider: String = ""
    var customProvider: String = ""
    var billingPeriodStart: Date = Date.monthsAgo(1)
    var billingPeriodEnd: Date = Date()
    var totalAmount: String = ""
    var totalKWh: String = ""
    var address: String = ""
    var lineItems: [EditableLineItem] = [EditableLineItem()]

    var showingProviderPicker = false
    var showingScanner = false
    var validationErrors: [String] = []

    struct EditableLineItem: Identifiable {
        var id = UUID()
        var category: ChargeCategory = .energyUsage
        var description: String = ""
        var amount: String = ""

        var amountValue: Double {
            Double(amount) ?? 0
        }

        var isValid: Bool {
            !description.isEmpty && amountValue > 0
        }
    }

    var selectedProvider: String {
        provider == "Other" ? customProvider : provider
    }

    var totalAmountValue: Double {
        Double(totalAmount) ?? 0
    }

    var totalKWhValue: Double {
        Double(totalKWh) ?? 0
    }

    var lineItemsTotal: Double {
        lineItems.reduce(0) { $0 + $1.amountValue }
    }

    var hasDiscrepancy: Bool {
        let diff = abs(totalAmountValue - lineItemsTotal)
        return totalAmountValue > 0 && lineItemsTotal > 0 && diff > 0.01
    }

    var isValid: Bool {
        validate()
        return validationErrors.isEmpty
    }

    func addLineItem() {
        lineItems.append(EditableLineItem())
    }

    func removeLineItem(at offsets: IndexSet) {
        lineItems.remove(atOffsets: offsets)
        if lineItems.isEmpty {
            lineItems.append(EditableLineItem())
        }
    }

    func validate() -> Bool {
        validationErrors.removeAll()

        if selectedProvider.isEmpty {
            validationErrors.append("Please select a provider")
        }
        if totalAmountValue <= 0 {
            validationErrors.append("Please enter a valid total amount")
        }
        if totalKWhValue <= 0 {
            validationErrors.append("Please enter your total kWh usage")
        }
        if billingPeriodEnd <= billingPeriodStart {
            validationErrors.append("End date must be after start date")
        }

        return validationErrors.isEmpty
    }

    func createBill() -> Bill? {
        guard validate() else { return nil }

        let bill = Bill(
            provider: selectedProvider,
            billingPeriodStart: billingPeriodStart,
            billingPeriodEnd: billingPeriodEnd,
            totalAmount: totalAmountValue,
            totalKWh: totalKWhValue,
            address: address
        )

        let validItems = lineItems.filter { $0.isValid }
        if validItems.isEmpty {
            // Auto-generate a single line item if none provided
            bill.lineItems = [
                BillLineItem(
                    category: .energyUsage,
                    itemDescription: "Total Energy Charges",
                    amount: totalAmountValue
                )
            ]
        } else {
            bill.lineItems = validItems.map { item in
                BillLineItem(
                    category: item.category,
                    itemDescription: item.description,
                    amount: item.amountValue
                )
            }
        }

        return bill
    }

    func reset() {
        provider = ""
        customProvider = ""
        billingPeriodStart = Date.monthsAgo(1)
        billingPeriodEnd = Date()
        totalAmount = ""
        totalKWh = ""
        address = ""
        lineItems = [EditableLineItem()]
        validationErrors = []
    }

    func loadFromScan(provider: String, total: Double, kWh: Double, items: [(ChargeCategory, String, Double)]) {
        self.provider = provider
        self.totalAmount = String(format: "%.2f", total)
        self.totalKWh = String(format: "%.0f", kWh)
        self.lineItems = items.map { category, desc, amount in
            EditableLineItem(category: category, description: desc, amount: String(format: "%.2f", amount))
        }
    }
}
