import Foundation

struct ParsedBillData {
    var provider: String = ""
    var totalAmount: Double = 0
    var totalKWh: Double = 0
    var lineItems: [(ChargeCategory, String, Double)] = []
    var accountNumber: String = ""
    var billingDate: Date?
    var dueDate: Date?
    var confidence: Double = 0
}

enum BillParsingService {
    // Known provider patterns
    private static let providerPatterns: [(pattern: String, name: String)] = [
        ("pacific gas|pg&e|pge", "Pacific Gas & Electric"),
        ("southern california edison|sce", "Southern California Edison"),
        ("duke energy", "Duke Energy"),
        ("con edison|coned", "Con Edison"),
        ("florida power|fpl", "Florida Power & Light"),
        ("dominion energy", "Dominion Energy"),
        ("national grid", "National Grid"),
        ("xcel energy", "Xcel Energy"),
        ("arizona public service|aps", "APS (Arizona Public Service)"),
        ("comed|commonwealth edison", "ComEd"),
        ("georgia power", "Georgia Power"),
        ("pseg|public service", "PSEG"),
    ]

    // Regex patterns for extracting bill data
    private static let totalAmountPatterns = [
        #"total\s*(?:amount\s*)?(?:due|owed|charges?)?\s*:?\s*\$?([\d,]+\.?\d{0,2})"#,
        #"amount\s*due\s*:?\s*\$?([\d,]+\.?\d{0,2})"#,
        #"please\s*pay\s*:?\s*\$?([\d,]+\.?\d{0,2})"#,
        #"balance\s*(?:due|forward)?\s*:?\s*\$?([\d,]+\.?\d{0,2})"#,
    ]

    private static let kWhPatterns = [
        #"([\d,]+)\s*kwh"#,
        #"total\s*(?:usage|consumption)\s*:?\s*([\d,]+)"#,
        #"energy\s*used\s*:?\s*([\d,]+)\s*kwh"#,
        #"kilowatt.hours?\s*:?\s*([\d,]+)"#,
    ]

    private static let chargePatterns: [(pattern: String, category: ChargeCategory)] = [
        (#"(?:basic|customer|service)\s*(?:charge|fee)\s*\$?([\d,]+\.?\d{0,2})"#, .baseCharge),
        (#"energy\s*(?:charge|usage)\s*\$?([\d,]+\.?\d{0,2})"#, .energyUsage),
        (#"(?:tier|block)\s*\d+\s*.*?\$?([\d,]+\.?\d{0,2})"#, .energyUsage),
        (#"(?:delivery|transmission)\s*(?:charge)?\s*\$?([\d,]+\.?\d{0,2})"#, .delivery),
        (#"(?:sales?\s*)?tax\s*\$?([\d,]+\.?\d{0,2})"#, .taxes),
        (#"(?:franchise|regulatory|surcharge)\s*(?:fee|charge)?\s*\$?([\d,]+\.?\d{0,2})"#, .fees),
        (#"fuel\s*(?:cost|charge|adjustment)\s*\$?([\d,]+\.?\d{0,2})"#, .delivery),
    ]

    static func parse(lines: [String]) -> ParsedBillData {
        var result = ParsedBillData()
        let fullText = lines.joined(separator: "\n").lowercased()
        var matchCount = 0

        // Detect provider
        for providerPattern in providerPatterns {
            if let _ = fullText.range(of: providerPattern.pattern, options: .regularExpression) {
                result.provider = providerPattern.name
                matchCount += 1
                break
            }
        }

        // Extract total amount
        for pattern in totalAmountPatterns {
            if let match = firstMatch(in: fullText, pattern: pattern) {
                let cleaned = match.replacingOccurrences(of: ",", with: "")
                if let amount = Double(cleaned), amount > 0 && amount < 10000 {
                    result.totalAmount = amount
                    matchCount += 1
                    break
                }
            }
        }

        // Extract kWh usage
        for pattern in kWhPatterns {
            if let match = firstMatch(in: fullText, pattern: pattern) {
                let cleaned = match.replacingOccurrences(of: ",", with: "")
                if let kWh = Double(cleaned), kWh > 0 && kWh < 100000 {
                    result.totalKWh = kWh
                    matchCount += 1
                    break
                }
            }
        }

        // Extract individual charges
        for chargePattern in chargePatterns {
            if let match = firstMatch(in: fullText, pattern: chargePattern.pattern) {
                let cleaned = match.replacingOccurrences(of: ",", with: "")
                if let amount = Double(cleaned), amount > 0 {
                    let description = extractDescription(from: fullText, for: chargePattern.pattern)
                    result.lineItems.append((chargePattern.category, description, amount))
                    matchCount += 1
                }
            }
        }

        // Calculate confidence
        let maxExpectedMatches = 6.0
        result.confidence = min(Double(matchCount) / maxExpectedMatches, 1.0)

        return result
    }

    private static func firstMatch(in text: String, pattern: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else {
            return nil
        }

        let range = NSRange(text.startIndex..., in: text)
        guard let match = regex.firstMatch(in: text, options: [], range: range) else {
            return nil
        }

        if match.numberOfRanges > 1 {
            let captureRange = match.range(at: 1)
            if let swiftRange = Range(captureRange, in: text) {
                return String(text[swiftRange])
            }
        }

        return nil
    }

    private static func extractDescription(from text: String, for pattern: String) -> String {
        // Try to extract a meaningful description from the matched line
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else {
            return "Charge"
        }

        let range = NSRange(text.startIndex..., in: text)
        guard let match = regex.firstMatch(in: text, options: [], range: range) else {
            return "Charge"
        }

        let matchRange = match.range(at: 0)
        if let swiftRange = Range(matchRange, in: text) {
            let matched = String(text[swiftRange])
            let cleaned = matched
                .replacingOccurrences(of: #"\$[\d,.]+"#, with: "", options: .regularExpression)
                .trimmingCharacters(in: .whitespaces)
                .capitalized
            return cleaned.isEmpty ? "Charge" : cleaned
        }

        return "Charge"
    }
}
