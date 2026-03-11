import SwiftUI

struct SavingsTipsView: View {
    @State private var viewModel = ProviderComparisonViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                categoryFilter
                tipsList
            }
            .padding()
        }
        .navigationTitle("Savings Tips")
        .onAppear {
            viewModel.loadData()
        }
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "lightbulb.fill")
                .font(.system(size: 36))
                .foregroundStyle(AppColors.solarYellow)

            Text("Save Money Without Solar")
                .font(.title2.bold())

            Text("Simple changes that can reduce your energy bill today")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                categoryPill(nil, label: "All")
                ForEach(SavingsTip.TipCategory.allCases) { category in
                    categoryPill(category, label: category.rawValue)
                }
            }
        }
    }

    private func categoryPill(_ category: SavingsTip.TipCategory?, label: String) -> some View {
        let isSelected = viewModel.selectedCategory == category
        return Button {
            withAnimation {
                viewModel.selectedCategory = category
            }
        } label: {
            Text(label)
                .font(.caption.bold())
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? AppColors.solarBlue : Color.secondary.opacity(0.1))
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
    }

    private var tipsList: some View {
        VStack(spacing: 12) {
            ForEach(viewModel.filteredTips) { tip in
                tipCard(tip)
            }
        }
    }

    private func tipCard(_ tip: SavingsTip) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: tip.icon)
                    .font(.title3)
                    .foregroundStyle(AppColors.solarBlue)
                    .frame(width: 36)

                VStack(alignment: .leading, spacing: 2) {
                    Text(tip.title)
                        .font(.headline)
                    HStack(spacing: 8) {
                        Text(tip.difficulty.rawValue)
                            .font(.caption2.bold())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(difficultyColor(tip.difficulty).opacity(0.15))
                            .foregroundStyle(difficultyColor(tip.difficulty))
                            .clipShape(Capsule())

                        Text(tip.category.rawValue)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                VStack(alignment: .trailing) {
                    Text(tip.estimatedSavings)
                        .font(.subheadline.bold())
                        .foregroundStyle(AppColors.solarGreen)
                    Text("per year")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Text(tip.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .cardStyle()
    }

    private func difficultyColor(_ difficulty: SavingsTip.Difficulty) -> Color {
        switch difficulty {
        case .easy: return .green
        case .moderate: return .orange
        case .advanced: return .red
        }
    }
}
