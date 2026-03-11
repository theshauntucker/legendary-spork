import Foundation

enum MockDataService {
    static func sampleBills() -> [(provider: String, start: Date, end: Date, total: Double, kWh: Double, items: [(ChargeCategory, String, Double)])] {
        [
            (
                provider: "Pacific Gas & Electric",
                start: Date.monthsAgo(1),
                end: Date(),
                total: 187.43,
                kWh: 892,
                items: [
                    (.baseCharge, "Basic Service Fee", 10.00),
                    (.energyUsage, "Tier 1 Usage (0-350 kWh)", 52.50),
                    (.energyUsage, "Tier 2 Usage (351-700 kWh)", 63.00),
                    (.energyUsage, "Tier 3 Usage (701+ kWh)", 34.56),
                    (.delivery, "Transmission Charge", 12.47),
                    (.taxes, "State Tax", 8.92),
                    (.fees, "Public Purpose Programs", 5.98)
                ]
            ),
            (
                provider: "Southern California Edison",
                start: Date.monthsAgo(2),
                end: Date.monthsAgo(1),
                total: 214.67,
                kWh: 1045,
                items: [
                    (.baseCharge, "Customer Charge", 12.00),
                    (.energyUsage, "Baseline Usage", 68.25),
                    (.energyUsage, "Over-Baseline Usage", 89.42),
                    (.delivery, "Delivery Charges", 18.50),
                    (.delivery, "Transmission", 9.75),
                    (.taxes, "City Utility Tax", 10.73),
                    (.fees, "Regulatory Fees", 6.02)
                ]
            ),
            (
                provider: "Duke Energy",
                start: Date.monthsAgo(3),
                end: Date.monthsAgo(2),
                total: 142.18,
                kWh: 756,
                items: [
                    (.baseCharge, "Basic Facilities Charge", 14.09),
                    (.energyUsage, "Energy Charge", 83.16),
                    (.delivery, "Fuel Cost Adjustment", 15.12),
                    (.taxes, "Sales Tax", 9.24),
                    (.fees, "Franchise Fee", 5.67),
                    (.fees, "Regulatory Fee", 3.45),
                    (.other, "Storm Recovery Surcharge", 11.45)
                ]
            ),
            (
                provider: "Con Edison",
                start: Date.monthsAgo(4),
                end: Date.monthsAgo(3),
                total: 265.92,
                kWh: 1180,
                items: [
                    (.baseCharge, "Basic Service Charge", 16.59),
                    (.energyUsage, "Supply Charges", 112.60),
                    (.delivery, "Delivery Charges", 86.45),
                    (.taxes, "Sales Tax", 21.27),
                    (.taxes, "City Surcharge", 14.89),
                    (.fees, "System Benefit Charge", 7.08),
                    (.fees, "Renewable Energy Charge", 7.04)
                ]
            ),
            (
                provider: "Florida Power & Light",
                start: Date.monthsAgo(5),
                end: Date.monthsAgo(4),
                total: 158.35,
                kWh: 925,
                items: [
                    (.baseCharge, "Customer Charge", 8.58),
                    (.energyUsage, "Energy Charge (first 1000 kWh)", 92.50),
                    (.delivery, "Fuel Charge", 31.85),
                    (.delivery, "Storm Protection", 6.42),
                    (.taxes, "Gross Receipts Tax", 7.12),
                    (.taxes, "Franchise Charge", 5.88),
                    (.fees, "Capacity Payment", 6.00)
                ]
            )
        ]
    }

    static func createSampleBills() -> [Bill] {
        sampleBills().map { data in
            let bill = Bill(
                provider: data.provider,
                billingPeriodStart: data.start,
                billingPeriodEnd: data.end,
                totalAmount: data.total,
                totalKWh: data.kWh,
                address: "123 Main St, Anytown, US"
            )
            bill.lineItems = data.items.map { category, description, amount in
                BillLineItem(category: category, itemDescription: description, amount: amount)
            }
            return bill
        }
    }

    static let commonProviders = [
        "Pacific Gas & Electric",
        "Southern California Edison",
        "Duke Energy",
        "Con Edison",
        "Florida Power & Light",
        "Dominion Energy",
        "National Grid",
        "Xcel Energy",
        "APS (Arizona Public Service)",
        "ComEd",
        "Georgia Power",
        "PSEG",
        "Other"
    ]
}
