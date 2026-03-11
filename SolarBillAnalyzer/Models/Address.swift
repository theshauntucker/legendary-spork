import Foundation
import CoreLocation

struct Address: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var street: String
    var city: String
    var state: String
    var zipCode: String
    var latitude: Double
    var longitude: Double

    var fullAddress: String {
        "\(street), \(city), \(state) \(zipCode)"
    }

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    static let placeholder = Address(
        street: "123 Solar Way",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        latitude: 33.4484,
        longitude: -112.0740
    )
}
