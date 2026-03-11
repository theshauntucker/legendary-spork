import Foundation
import CoreLocation

protocol SolarScoringServiceProtocol {
    func calculateScore(latitude: Double, longitude: Double, roofAreaSqFt: Double) -> SolarScoreResult
}

struct SolarScoreResult {
    let score: Int
    let annualSunHours: Double
    let climateZone: String
    let estimatedSystemSizeKW: Double
    let factors: [ScoringFactor]
    let estimatedAnnualProduction: Double
}

struct ScoringFactor: Identifiable {
    let id = UUID()
    let name: String
    let score: Double
    let maxScore: Double
    let description: String
}

final class MockSolarScoringService: SolarScoringServiceProtocol {
    func calculateScore(latitude: Double, longitude: Double, roofAreaSqFt: Double) -> SolarScoreResult {
        // 1. Latitude factor (0-30 points)
        // Optimal solar belt is roughly 25°-35°N in the US
        let absLat = abs(latitude)
        let latitudeFactor: Double
        if absLat >= 25 && absLat <= 35 {
            latitudeFactor = 30.0
        } else if absLat < 25 {
            latitudeFactor = 25.0 + (absLat / 25.0) * 5.0
        } else if absLat <= 45 {
            latitudeFactor = max(15.0, 30.0 - (absLat - 35.0) * 1.5)
        } else {
            latitudeFactor = max(5.0, 15.0 - (absLat - 45.0) * 1.0)
        }

        // 2. Climate zone factor (0-25 points)
        // Estimate based on longitude + latitude (rough US climate zones)
        let climateData = estimateClimate(latitude: latitude, longitude: longitude)
        let climateFactor = climateData.factor

        // 3. Roof area factor (0-20 points)
        // 1500+ sqft is ideal for residential solar
        let roofFactor: Double
        if roofAreaSqFt >= 1500 {
            roofFactor = 20.0
        } else if roofAreaSqFt >= 1000 {
            roofFactor = 15.0 + ((roofAreaSqFt - 1000) / 500.0) * 5.0
        } else if roofAreaSqFt >= 500 {
            roofFactor = 8.0 + ((roofAreaSqFt - 500) / 500.0) * 7.0
        } else {
            roofFactor = max(2.0, (roofAreaSqFt / 500.0) * 8.0)
        }

        // 4. Orientation bonus (0-15 points)
        // Assume south-facing for mock (best case)
        let orientationBonus = 13.0

        // 5. Shading penalty (0-10 points deducted)
        // Use a deterministic "random" based on coordinates
        let shadingSeed = abs(Int((latitude * 1000 + longitude * 1000).truncatingRemainder(dividingBy: 10)))
        let shadingPenalty = Double(shadingSeed % 6) + 1.0  // 1-6 points penalty

        let rawScore = latitudeFactor + climateFactor + roofFactor + orientationBonus - shadingPenalty
        let finalScore = min(100, max(0, Int(rawScore)))

        // Calculate sun hours and system size
        let annualSunHours = climateData.sunHours
        let dailyPeakHours = annualSunHours / 365.0
        let usableRoofSqFt = roofAreaSqFt * 0.65  // 65% usable
        let panelSqFt: Double = 17.5  // ~400W panel
        let maxPanels = Int(usableRoofSqFt / panelSqFt)
        let systemSizeKW = Double(min(maxPanels, 30)) * 0.4  // 400W panels, max 12kW typical

        let annualProduction = systemSizeKW * dailyPeakHours * 365 * (1 - AppConstants.systemLossFactor)

        let factors = [
            ScoringFactor(name: "Location & Latitude", score: latitudeFactor, maxScore: 30, description: latitudeDescription(absLat)),
            ScoringFactor(name: "Climate & Sun Hours", score: climateFactor, maxScore: 25, description: "\(climateData.zone) — \(String(format: "%.0f", annualSunHours)) sun hours/year"),
            ScoringFactor(name: "Roof Area", score: roofFactor, maxScore: 20, description: "\(Int(roofAreaSqFt)) sq ft available"),
            ScoringFactor(name: "Roof Orientation", score: orientationBonus, maxScore: 15, description: "South-facing (optimal)"),
            ScoringFactor(name: "Shading", score: -shadingPenalty, maxScore: 10, description: "Minor shading detected"),
        ]

        return SolarScoreResult(
            score: finalScore,
            annualSunHours: annualSunHours,
            climateZone: climateData.zone,
            estimatedSystemSizeKW: systemSizeKW,
            factors: factors,
            estimatedAnnualProduction: annualProduction
        )
    }

    private func estimateClimate(latitude: Double, longitude: Double) -> (zone: String, sunHours: Double, factor: Double) {
        let absLat = abs(latitude)

        // Simplified US climate zone estimation
        if absLat <= 28 && longitude > -100 {
            return ("Subtropical", 2600, 23.0)
        } else if absLat <= 35 && longitude < -100 {
            return ("Desert/Arid", 2900, 25.0)
        } else if absLat <= 35 {
            return ("Warm Temperate", 2400, 21.0)
        } else if absLat <= 42 {
            return ("Temperate", 2100, 18.0)
        } else if absLat <= 48 {
            return ("Cool Temperate", 1800, 14.0)
        } else {
            return ("Northern", 1500, 10.0)
        }
    }

    private func latitudeDescription(_ latitude: Double) -> String {
        if latitude >= 25 && latitude <= 35 {
            return "Optimal solar belt location"
        } else if latitude < 25 {
            return "Near-equatorial — excellent sun exposure"
        } else if latitude <= 42 {
            return "Good solar potential for your latitude"
        } else {
            return "Northern latitude — seasonal variation expected"
        }
    }
}
