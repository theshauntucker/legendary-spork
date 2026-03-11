import Foundation
import SwiftData

@Model
final class SolarProfile {
    var id: UUID
    var address: String
    var latitude: Double
    var longitude: Double
    var roofAreaSqFt: Double
    var solarScore: Int
    var annualSunHours: Double
    var climateZone: String
    var estimatedSystemSizeKW: Double
    var lastCalculated: Date

    init(
        id: UUID = UUID(),
        address: String,
        latitude: Double,
        longitude: Double,
        roofAreaSqFt: Double = 1500,
        solarScore: Int = 0,
        annualSunHours: Double = 0,
        climateZone: String = "",
        estimatedSystemSizeKW: Double = 0,
        lastCalculated: Date = Date()
    ) {
        self.id = id
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.roofAreaSqFt = roofAreaSqFt
        self.solarScore = solarScore
        self.annualSunHours = annualSunHours
        self.climateZone = climateZone
        self.estimatedSystemSizeKW = estimatedSystemSizeKW
        self.lastCalculated = lastCalculated
    }

    var scoreDescription: String {
        switch solarScore {
        case 80...100: return "Excellent"
        case 60..<80: return "Good"
        case 40..<60: return "Fair"
        case 20..<40: return "Below Average"
        default: return "Poor"
        }
    }

    var scoreColor: String {
        switch solarScore {
        case 80...100: return "ScoreExcellent"
        case 60..<80: return "ScoreGood"
        case 40..<60: return "ScoreFair"
        case 20..<40: return "ScoreBelowAverage"
        default: return "ScorePoor"
        }
    }
}
