import SwiftUI
import Charts

struct ChargeDetailView: View {
    let category: ChargeCategory
    let items: [BillLineItem]
    let totalBillAmount: Double

    private var categoryTotal: Double {
        items.reduce(0) { $0 + $1.amount }
    }

    private var percentageOfTotal: Double {
        totalBillAmount > 0 ? categoryTotal / totalBillAmount : 0
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: category.iconName)
                        .font(.system(size: 40))
                        .foregroundStyle(AppColors.solarBlue)

                    Text(category.rawValue)
                        .font(.title2.bold())

                    Text(categoryTotal.asCurrency)
                        .font(.system(size: 36, weight: .bold, design: .rounded))

                    Text("\(percentageOfTotal.asPercentage) of total bill")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .cardStyle()

                // Bar chart of items
                if items.count > 1 {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Charge Breakdown")
                            .font(.headline)

                        Chart(items) { item in
                            BarMark(
                                x: .value("Amount", item.amount),
                                y: .value("Charge", item.itemDescription)
                            )
                            .foregroundStyle(AppColors.solarBlue.gradient)
                            .cornerRadius(4)
                        }
                        .frame(height: CGFloat(items.count) * 50)
                    }
                    .cardStyle()
                }

                // Item list
                VStack(alignment: .leading, spacing: 12) {
                    Text("Individual Charges")
                        .font(.headline)

                    ForEach(items) { item in
                        HStack {
                            Text(item.itemDescription)
                                .font(.subheadline)
                            Spacer()
                            Text(item.amount.asCurrency)
                                .font(.subheadline.bold())
                        }
                        .padding(.vertical, 4)
                        Divider()
                    }
                }
                .cardStyle()
            }
            .padding()
        }
        .navigationTitle(category.rawValue)
        .navigationBarTitleDisplayMode(.inline)
    }
}
