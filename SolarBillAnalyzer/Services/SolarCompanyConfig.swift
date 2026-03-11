import Foundation

struct SolarCompanyInfo {
    var companyName: String
    var tagline: String
    var phoneNumber: String
    var email: String
    var website: String
    var address: String
    var description: String
    var yearsInBusiness: Int
    var installationsCompleted: Int
    var averageRating: Double
    var certifications: [String]

    var formattedPhone: String {
        // Format: (555) 123-4567
        let digits = phoneNumber.filter { $0.isNumber }
        guard digits.count == 10 else { return phoneNumber }
        let area = digits.prefix(3)
        let mid = digits.dropFirst(3).prefix(3)
        let last = digits.suffix(4)
        return "(\(area)) \(mid)-\(last)"
    }

    var phoneURL: URL? {
        let digits = phoneNumber.filter { $0.isNumber }
        return URL(string: "tel://\(digits)")
    }

    var emailURL: URL? {
        URL(string: "mailto:\(email)")
    }

    var websiteURL: URL? {
        URL(string: website)
    }

    func emailWithContext(solarScore: Int?, estimatedSavings: Double?) -> URL? {
        var subject = "Solar Quote Request from SolarBill Analyzer"
        var body = "Hi \(companyName) team,\n\nI'm interested in learning more about solar for my home."

        if let score = solarScore {
            body += "\n\nMy solar score is \(score)/100."
        }
        if let savings = estimatedSavings {
            body += "\nEstimated annual savings: \(savings.asCurrency)."
        }

        body += "\n\nPlease contact me to schedule a consultation.\n\nThank you!"

        let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""

        return URL(string: "mailto:\(email)?subject=\(encodedSubject)&body=\(encodedBody)")
    }
}

enum SolarCompanyConfig {
    // Configure your solar company info here
    static let company = SolarCompanyInfo(
        companyName: "Your Solar Company",
        tagline: "Powering Homes with Clean Energy",
        phoneNumber: "5551234567",
        email: "info@yoursolarccompany.com",
        website: "https://www.yoursolarcompany.com",
        address: "123 Solar Drive, Suite 100, Your City, ST 12345",
        description: "We're a full-service solar installation company dedicated to helping homeowners save money and reduce their carbon footprint. Our team of certified professionals has been serving the community for over a decade.",
        yearsInBusiness: 12,
        installationsCompleted: 2500,
        averageRating: 4.9,
        certifications: [
            "NABCEP Certified",
            "Licensed & Insured",
            "BBB A+ Rated",
            "Tesla Powerwall Certified"
        ]
    )
}
