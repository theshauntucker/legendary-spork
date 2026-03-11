import SwiftUI
import SwiftData

struct ContactSolarCompanyView: View {
    @Query(sort: \SolarProfile.lastCalculated, order: .reverse) private var profiles: [SolarProfile]
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @Environment(\.openURL) private var openURL

    private let company = SolarCompanyConfig.company

    private var latestProfile: SolarProfile? { profiles.first }
    private var latestBill: Bill? { bills.first }

    private var estimatedAnnualSavings: Double? {
        guard let bill = latestBill else { return nil }
        return bill.totalAmount * 12 * 0.7 // Rough estimate: 70% offset
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                heroSection
                companyInfoSection
                credentialsSection
                contactActionsSection
                personalizedSection
                whyChooseUsSection
            }
            .padding()
        }
        .navigationTitle("Get a Quote")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var heroSection: some View {
        VStack(spacing: 16) {
            // Company logo placeholder
            ZStack {
                Circle()
                    .fill(AppColors.solarOrange.gradient)
                    .frame(width: 80, height: 80)
                Image(systemName: "sun.max.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.white)
            }

            Text(company.companyName)
                .font(.title.bold())

            Text(company.tagline)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            // Rating
            HStack(spacing: 4) {
                ForEach(0..<5) { index in
                    Image(systemName: Double(index) < company.averageRating ? "star.fill" : "star")
                        .font(.caption)
                        .foregroundStyle(.yellow)
                }
                Text(String(format: "%.1f", company.averageRating))
                    .font(.caption.bold())
                Text("(\(company.installationsCompleted)+ installs)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var companyInfoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("About Us")
                .font(.headline)

            Text(company.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 20) {
                statBadge(value: "\(company.yearsInBusiness)+", label: "Years")
                statBadge(value: "\(company.installationsCompleted)+", label: "Installs")
                statBadge(value: String(format: "%.1f", company.averageRating), label: "Rating")
            }
        }
        .cardStyle()
    }

    private func statBadge(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3.bold())
                .foregroundStyle(AppColors.solarOrange)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var credentialsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Credentials")
                .font(.headline)

            ForEach(company.certifications, id: \.self) { cert in
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(AppColors.solarGreen)
                    Text(cert)
                        .font(.subheadline)
                }
            }
        }
        .cardStyle()
    }

    private var contactActionsSection: some View {
        VStack(spacing: 12) {
            // Phone
            Button {
                if let url = company.phoneURL {
                    openURL(url)
                }
            } label: {
                HStack {
                    Image(systemName: "phone.fill")
                        .font(.title3)
                    VStack(alignment: .leading) {
                        Text("Call Us")
                            .font(.headline)
                        Text(company.formattedPhone)
                            .font(.caption)
                    }
                    Spacer()
                    Text("Tap to Call")
                        .font(.caption.bold())
                        .foregroundStyle(AppColors.solarGreen)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(AppColors.solarGreen.opacity(0.1))
                .foregroundStyle(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(AppColors.solarGreen.opacity(0.3), lineWidth: 1)
                )
            }

            // Email
            Button {
                if let url = company.emailWithContext(
                    solarScore: latestProfile?.solarScore,
                    estimatedSavings: estimatedAnnualSavings
                ) {
                    openURL(url)
                }
            } label: {
                HStack {
                    Image(systemName: "envelope.fill")
                        .font(.title3)
                    VStack(alignment: .leading) {
                        Text("Email Us")
                            .font(.headline)
                        Text(company.email)
                            .font(.caption)
                    }
                    Spacer()
                    Text("Send Email")
                        .font(.caption.bold())
                        .foregroundStyle(AppColors.solarBlue)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(AppColors.solarBlue.opacity(0.1))
                .foregroundStyle(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(AppColors.solarBlue.opacity(0.3), lineWidth: 1)
                )
            }

            // Website
            Button {
                if let url = company.websiteURL {
                    openURL(url)
                }
            } label: {
                HStack {
                    Image(systemName: "globe")
                        .font(.title3)
                    VStack(alignment: .leading) {
                        Text("Visit Website")
                            .font(.headline)
                        Text(company.website)
                            .font(.caption)
                    }
                    Spacer()
                    Image(systemName: "arrow.up.right.square")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.secondary.opacity(0.08))
                .foregroundStyle(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private var personalizedSection: some View {
        Group {
            if latestProfile != nil || latestBill != nil {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Your Solar Profile")
                        .font(.headline)

                    if let profile = latestProfile {
                        HStack {
                            Image(systemName: "sun.max.fill")
                                .foregroundStyle(AppColors.solarOrange)
                            Text("Solar Score: \(profile.solarScore)/100 (\(profile.scoreDescription))")
                                .font(.subheadline)
                        }

                        HStack {
                            Image(systemName: "bolt.fill")
                                .foregroundStyle(AppColors.solarOrange)
                            Text("Recommended System: \(String(format: "%.1f", profile.estimatedSystemSizeKW)) kW")
                                .font(.subheadline)
                        }
                    }

                    if let savings = estimatedAnnualSavings {
                        HStack {
                            Image(systemName: "dollarsign.circle.fill")
                                .foregroundStyle(AppColors.solarGreen)
                            Text("Estimated Annual Savings: \(savings.asCurrency)")
                                .font(.subheadline)
                        }
                    }

                    Text("This information will be included when you contact us so we can provide a more accurate quote.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .cardStyle()
            }
        }
    }

    private var whyChooseUsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Why Choose \(company.companyName)?")
                .font(.headline)

            benefitRow(icon: "shield.checkmark.fill", title: "Free Consultation", description: "No-obligation assessment of your home's solar potential")
            benefitRow(icon: "wrench.and.screwdriver.fill", title: "Professional Installation", description: "Licensed, insured, and NABCEP certified installers")
            benefitRow(icon: "doc.text.fill", title: "Permit & Paperwork", description: "We handle all permits, inspections, and utility paperwork")
            benefitRow(icon: "clock.fill", title: "25-Year Warranty", description: "Industry-leading warranty on panels and workmanship")
            benefitRow(icon: "dollarsign.circle.fill", title: "Financing Options", description: "Cash, loan, and lease options with competitive rates")
            benefitRow(icon: "headphones.circle.fill", title: "Ongoing Support", description: "Monitoring, maintenance, and customer support for life")
        }
        .cardStyle()
    }

    private func benefitRow(icon: String, title: String, description: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(AppColors.solarOrange)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.bold())
                Text(description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// MARK: - Reusable CTA Card
struct SolarCompanyCTACard: View {
    var solarScore: Int?
    var estimatedSavings: Double?
    var compact: Bool = false

    private let company = SolarCompanyConfig.company

    var body: some View {
        NavigationLink {
            ContactSolarCompanyView()
        } label: {
            if compact {
                compactLayout
            } else {
                fullLayout
            }
        }
    }

    private var compactLayout: some View {
        HStack(spacing: 12) {
            Image(systemName: "phone.circle.fill")
                .font(.title2)
                .foregroundStyle(AppColors.solarGreen)

            VStack(alignment: .leading, spacing: 2) {
                Text("Get a Free Solar Quote")
                    .font(.subheadline.bold())
                    .foregroundStyle(.primary)
                Text(company.companyName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(AppColors.solarGreen.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var fullLayout: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "sun.max.fill")
                    .font(.title2)
                    .foregroundStyle(AppColors.solarOrange)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Ready to Go Solar?")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text("Get a free, personalized quote from \(company.companyName)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }

            HStack {
                Text("Get Free Quote")
                    .font(.subheadline.bold())
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(AppColors.solarGreen)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .cardStyle()
    }
}
