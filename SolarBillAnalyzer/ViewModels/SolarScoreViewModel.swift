import Foundation
import SwiftData
import MapKit

@Observable
final class SolarScoreViewModel {
    var addressQuery: String = ""
    var selectedAddress: Address?
    var roofAreaSqFt: String = "1500"
    var isCalculating = false
    var scoreResult: SolarScoreResult?
    var searchResults: [MKLocalSearchCompletion] = []
    var errorMessage: String?
    var hasCalculated = false

    private let scoringService: SolarScoringServiceProtocol = MockSolarScoringService()
    private let searchCompleter = AddressSearchCompleter()

    var roofAreaValue: Double {
        Double(roofAreaSqFt) ?? 1500
    }

    var scoreColor: String {
        guard let score = scoreResult?.score else { return "ScorePoor" }
        switch score {
        case 80...100: return "Excellent"
        case 60..<80: return "Good"
        case 40..<60: return "Fair"
        case 20..<40: return "Below Average"
        default: return "Poor"
        }
    }

    func startAddressSearch() {
        searchCompleter.onResultsUpdate = { [weak self] results in
            self?.searchResults = results
        }
        searchCompleter.updateQuery(addressQuery)
    }

    func selectSearchResult(_ completion: MKLocalSearchCompletion) async {
        addressQuery = "\(completion.title), \(completion.subtitle)"
        searchResults = []

        let request = MKLocalSearch.Request(completion: completion)
        do {
            let response = try await MKLocalSearch(request: request).start()
            if let item = response.mapItems.first {
                selectedAddress = Address(
                    street: [item.placemark.subThoroughfare, item.placemark.thoroughfare]
                        .compactMap { $0 }.joined(separator: " "),
                    city: item.placemark.locality ?? "",
                    state: item.placemark.administrativeArea ?? "",
                    zipCode: item.placemark.postalCode ?? "",
                    latitude: item.placemark.coordinate.latitude,
                    longitude: item.placemark.coordinate.longitude
                )
            }
        } catch {
            errorMessage = "Could not find that address. Please try again."
        }
    }

    func calculateScore() {
        guard let address = selectedAddress else {
            errorMessage = "Please select an address first"
            return
        }

        isCalculating = true
        errorMessage = nil

        // Simulate brief calculation time
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [self] in
            let result = scoringService.calculateScore(
                latitude: address.latitude,
                longitude: address.longitude,
                roofAreaSqFt: roofAreaValue
            )
            scoreResult = result
            isCalculating = false
            hasCalculated = true
        }
    }

    func createSolarProfile() -> SolarProfile? {
        guard let address = selectedAddress, let result = scoreResult else { return nil }

        return SolarProfile(
            address: address.fullAddress,
            latitude: address.latitude,
            longitude: address.longitude,
            roofAreaSqFt: roofAreaValue,
            solarScore: result.score,
            annualSunHours: result.annualSunHours,
            climateZone: result.climateZone,
            estimatedSystemSizeKW: result.estimatedSystemSizeKW
        )
    }

    func reset() {
        addressQuery = ""
        selectedAddress = nil
        roofAreaSqFt = "1500"
        scoreResult = nil
        hasCalculated = false
        errorMessage = nil
    }
}

// MARK: - Address Search Completer
final class AddressSearchCompleter: NSObject, MKLocalSearchCompleterDelegate {
    private let completer = MKLocalSearchCompleter()
    var onResultsUpdate: (([MKLocalSearchCompletion]) -> Void)?

    override init() {
        super.init()
        completer.delegate = self
        completer.resultTypes = .address
    }

    func updateQuery(_ query: String) {
        completer.queryFragment = query
    }

    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        onResultsUpdate?(completer.results)
    }

    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        // Silently handle - user may still be typing
    }
}
