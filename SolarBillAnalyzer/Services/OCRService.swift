import Foundation
import Vision
import UIKit

actor OCRService {
    enum OCRError: Error, LocalizedError {
        case imageConversionFailed
        case recognitionFailed(Error)
        case noTextFound

        var errorDescription: String? {
            switch self {
            case .imageConversionFailed:
                return "Failed to process the image"
            case .recognitionFailed(let error):
                return "Text recognition failed: \(error.localizedDescription)"
            case .noTextFound:
                return "No text was found in the image"
            }
        }
    }

    func recognizeText(in image: UIImage) async throws -> [String] {
        guard let cgImage = image.cgImage else {
            throw OCRError.imageConversionFailed
        }

        return try await withCheckedThrowingContinuation { continuation in
            let request = VNRecognizeTextRequest { request, error in
                if let error = error {
                    continuation.resume(throwing: OCRError.recognitionFailed(error))
                    return
                }

                guard let observations = request.results as? [VNRecognizedTextObservation] else {
                    continuation.resume(throwing: OCRError.noTextFound)
                    return
                }

                let recognizedStrings = observations.compactMap { observation in
                    observation.topCandidates(1).first?.string
                }

                if recognizedStrings.isEmpty {
                    continuation.resume(throwing: OCRError.noTextFound)
                } else {
                    continuation.resume(returning: recognizedStrings)
                }
            }

            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true

            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            do {
                try handler.perform([request])
            } catch {
                continuation.resume(throwing: OCRError.recognitionFailed(error))
            }
        }
    }
}
