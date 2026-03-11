import Foundation
import SwiftUI

extension Double {
    var asCurrency: String {
        Formatters.currency.string(from: NSNumber(value: self)) ?? "$0.00"
    }

    var asKWh: String {
        "\(Formatters.decimal.string(from: NSNumber(value: self)) ?? "0") kWh"
    }

    var asPercentage: String {
        "\(Formatters.percentage.string(from: NSNumber(value: self)) ?? "0%")"
    }

    var asCompactCurrency: String {
        if self >= 1000 {
            return "$\(Formatters.decimal.string(from: NSNumber(value: self / 1000)) ?? "0")K"
        }
        return asCurrency
    }
}

extension Date {
    var shortFormatted: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: self)
    }

    var monthYear: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yyyy"
        return formatter.string(from: self)
    }

    var monthName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM"
        return formatter.string(from: self)
    }

    static func daysAgo(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: -days, to: Date()) ?? Date()
    }

    static func monthsAgo(_ months: Int) -> Date {
        Calendar.current.date(byAdding: .month, value: -months, to: Date()) ?? Date()
    }
}

extension View {
    func cardStyle() -> some View {
        self
            .padding()
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
