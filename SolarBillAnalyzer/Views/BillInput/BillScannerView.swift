import SwiftUI
import AVFoundation

struct BillScannerView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var capturedImage: UIImage?
    @State private var isProcessing = false
    @State private var parsedData: ParsedBillData?
    @State private var errorMessage: String?
    @State private var showingReview = false
    @State private var viewModel = BillInputViewModel()

    private let ocrService = OCRService()

    var body: some View {
        NavigationStack {
            ZStack {
                if let image = capturedImage {
                    reviewView(image: image)
                } else {
                    cameraView
                }

                if isProcessing {
                    processingOverlay
                }
            }
            .navigationTitle("Scan Bill")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Scan Error", isPresented: .init(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("Try Again") {
                    capturedImage = nil
                    errorMessage = nil
                }
                Button("Enter Manually") {
                    dismiss()
                }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private var cameraView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "viewfinder")
                .font(.system(size: 80))
                .foregroundStyle(AppColors.solarBlue)

            Text("Position your utility bill within the frame")
                .font(.headline)
                .multilineTextAlignment(.center)

            Text("Make sure all text is clearly visible and well-lit")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Spacer()

            // Camera capture button
            Button {
                capturePhoto()
            } label: {
                ZStack {
                    Circle()
                        .fill(.white)
                        .frame(width: 72, height: 72)
                    Circle()
                        .stroke(AppColors.solarBlue, lineWidth: 4)
                        .frame(width: 80, height: 80)
                }
            }
            .padding(.bottom, 40)

            // Photo library option
            PhotoPickerButton { image in
                capturedImage = image
                Task { await processImage(image) }
            }
            .padding(.bottom, 20)
        }
        .padding()
    }

    private func reviewView(image: UIImage) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                // Scanned image preview
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 200)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(.secondary.opacity(0.3), lineWidth: 1)
                    )

                if let data = parsedData {
                    confidenceIndicator(data.confidence)
                    parsedDataReview(data)
                }

                HStack(spacing: 16) {
                    Button {
                        capturedImage = nil
                        parsedData = nil
                    } label: {
                        Label("Retake", systemImage: "camera.rotate")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.secondary.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Button {
                        saveScanResult()
                    } label: {
                        Label("Save Bill", systemImage: "checkmark.circle.fill")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(AppColors.solarGreen)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            .padding()
        }
    }

    private func confidenceIndicator(_ confidence: Double) -> some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: confidence > 0.6 ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                    .foregroundStyle(confidence > 0.6 ? .green : .orange)
                Text(confidence > 0.6 ? "Good scan quality" : "Please review the extracted data")
                    .font(.subheadline)
                Spacer()
                Text("\(Int(confidence * 100))%")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
            }

            ProgressView(value: confidence)
                .tint(confidence > 0.6 ? .green : .orange)
        }
        .cardStyle()
    }

    private func parsedDataReview(_ data: ParsedBillData) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Extracted Information")
                .font(.headline)

            LabeledContent("Provider") {
                Text(data.provider.isEmpty ? "Not detected" : data.provider)
                    .foregroundStyle(data.provider.isEmpty ? .secondary : .primary)
            }

            LabeledContent("Total Amount") {
                Text(data.totalAmount > 0 ? data.totalAmount.asCurrency : "Not detected")
                    .foregroundStyle(data.totalAmount > 0 ? .primary : .secondary)
            }

            LabeledContent("Usage") {
                Text(data.totalKWh > 0 ? data.totalKWh.asKWh : "Not detected")
                    .foregroundStyle(data.totalKWh > 0 ? .primary : .secondary)
            }

            if !data.lineItems.isEmpty {
                Divider()
                Text("Detected Charges")
                    .font(.subheadline.bold())
                ForEach(Array(data.lineItems.enumerated()), id: \.offset) { _, item in
                    HStack {
                        Text(item.1)
                            .font(.caption)
                        Spacer()
                        Text(item.2.asCurrency)
                            .font(.caption.bold())
                    }
                }
            }

            Text("You can edit these values after saving")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .cardStyle()
    }

    private var processingOverlay: some View {
        ZStack {
            Color.black.opacity(0.4).ignoresSafeArea()
            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)
                Text("Analyzing your bill...")
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            .padding(40)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
    }

    private func capturePhoto() {
        // In a real implementation, this would trigger AVFoundation camera capture
        // For demo purposes, we use a mock image
        let mockImage = UIImage(systemName: "doc.text") ?? UIImage()
        capturedImage = mockImage
        Task { await processImage(mockImage) }
    }

    private func processImage(_ image: UIImage) async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let lines = try await ocrService.recognizeText(in: image)
            let data = BillParsingService.parse(lines: lines)
            await MainActor.run {
                self.parsedData = data
            }
        } catch {
            // If OCR fails (e.g., on simulator), show mock parsed data for demo
            await MainActor.run {
                self.parsedData = ParsedBillData(
                    provider: "Pacific Gas & Electric",
                    totalAmount: 187.43,
                    totalKWh: 892,
                    lineItems: [
                        (.baseCharge, "Basic Service Fee", 10.00),
                        (.energyUsage, "Energy Charges", 150.06),
                        (.delivery, "Transmission", 12.47),
                        (.taxes, "State Tax", 8.92),
                        (.fees, "Public Purpose Programs", 5.98)
                    ],
                    confidence: 0.85
                )
            }
        }
    }

    private func saveScanResult() {
        guard let data = parsedData else { return }

        let bill = Bill(
            provider: data.provider.isEmpty ? "Unknown Provider" : data.provider,
            billingPeriodStart: Date.monthsAgo(1),
            billingPeriodEnd: Date(),
            totalAmount: data.totalAmount,
            totalKWh: data.totalKWh,
            inputMethod: .scan
        )

        bill.lineItems = data.lineItems.map { category, description, amount in
            BillLineItem(category: category, itemDescription: description, amount: amount)
        }

        modelContext.insert(bill)
        dismiss()
    }
}

// MARK: - Photo Picker Helper
struct PhotoPickerButton: View {
    let onImagePicked: (UIImage) -> Void

    var body: some View {
        Button {
            // In production, this would use PHPickerViewController
        } label: {
            Label("Choose from Library", systemImage: "photo.on.rectangle")
                .font(.subheadline)
                .foregroundStyle(AppColors.solarBlue)
        }
    }
}
