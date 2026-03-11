import SwiftUI
import SwiftData

struct DashboardView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @Query(sort: \SolarProfile.lastCalculated, order: .reverse) private var solarProfiles: [SolarProfile]
    @State private var showingBillEntry = false
    @State private var selectedBill: Bill?

    private var latestBill: Bill? { bills.first }
    private var latestProfile: SolarProfile? { solarProfiles.first }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    welcomeHeader
                    quickActionsSection
                    if let bill = latestBill {
                        latestBillCard(bill)
                    }
                    if let profile = latestProfile {
                        solarScoreCard(profile)
                    }
                    if latestBill == nil && latestProfile == nil {
                        emptyStateView
                    }
                    contactCTACard
                }
                .padding()
            }
            .navigationTitle(AppConstants.appName)
            .sheet(isPresented: $showingBillEntry) {
                ManualBillEntryView()
            }
            .navigationDestination(item: $selectedBill) { bill in
                BillBreakdownView(bill: bill)
            }
        }
    }

    private var welcomeHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Welcome Back")
                .font(.title.bold())
            Text("Understand your energy costs and discover solar savings")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var quickActionsSection: some View {
        HStack(spacing: 12) {
            quickActionButton(icon: "camera.fill", title: "Scan Bill", color: AppColors.solarBlue) {
                // Navigate to scanner
            }
            quickActionButton(icon: "keyboard.fill", title: "Enter Bill", color: AppColors.solarGreen) {
                showingBillEntry = true
            }
            quickActionButton(icon: "sun.max.fill", title: "Solar Score", color: AppColors.solarOrange) {
                // Navigate to solar tab
            }
        }
    }

    private func quickActionButton(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                Text(title)
                    .font(.caption.bold())
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(color.opacity(0.12))
            .foregroundStyle(color)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private func latestBillCard(_ bill: Bill) -> some View {
        Button {
            selectedBill = bill
        } label: {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("Latest Bill", systemImage: "doc.text.fill")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundStyle(.tertiary)
                }

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(bill.provider)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(bill.totalAmount.asCurrency)
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundStyle(.primary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(bill.totalKWh.asKWh)
                            .font(.subheadline.bold())
                            .foregroundStyle(.primary)
                        Text(bill.billingPeriodDescription)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .cardStyle()
        }
    }

    private func solarScoreCard(_ profile: SolarProfile) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Solar Potential", systemImage: "sun.max.fill")
                .font(.headline)

            HStack {
                VStack(alignment: .leading) {
                    Text("\(profile.solarScore)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundStyle(AppColors.solarOrange)
                    Text(profile.scoreDescription)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text(String(format: "%.1f kW", profile.estimatedSystemSizeKW))
                        .font(.headline)
                    Text("Recommended System")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .cardStyle()
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "sun.max.trianglebadge.exclamationmark")
                .font(.system(size: 60))
                .foregroundStyle(AppColors.solarOrange)

            Text("Get Started")
                .font(.title2.bold())

            Text("Add your first utility bill to see a detailed cost breakdown and discover your solar savings potential.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                showingBillEntry = true
            } label: {
                Label("Enter Your First Bill", systemImage: "plus.circle.fill")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppColors.solarBlue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(.vertical, 20)
        .cardStyle()
    }

    private var contactCTACard: some View {
        SolarCompanyCTACard(
            solarScore: latestProfile?.solarScore,
            estimatedSavings: latestBill.map { $0.totalAmount * 12 * 0.7 }
        )
    }
}
