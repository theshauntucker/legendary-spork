import Foundation
import SwiftData

@Model
final class BillLineItem {
    var id: UUID
    var category: ChargeCategory
    var itemDescription: String
    var amount: Double
    var bill: Bill?

    init(
        id: UUID = UUID(),
        category: ChargeCategory,
        itemDescription: String,
        amount: Double
    ) {
        self.id = id
        self.category = category
        self.itemDescription = itemDescription
        self.amount = amount
    }
}
