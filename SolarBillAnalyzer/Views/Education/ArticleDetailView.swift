import SwiftUI

struct ArticleDetailView: View {
    let article: EducationalArticle

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: article.icon)
                        .font(.system(size: 48))
                        .foregroundStyle(AppColors.solarOrange)

                    Text(article.title)
                        .font(.title.bold())
                        .multilineTextAlignment(.center)

                    Text(article.category)
                        .font(.caption.bold())
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(AppColors.solarBlue.opacity(0.1))
                        .foregroundStyle(AppColors.solarBlue)
                        .clipShape(Capsule())
                }
                .frame(maxWidth: .infinity)
                .padding(.bottom, 8)

                // Content
                ForEach(parseContent(article.content), id: \.self) { block in
                    contentBlock(block)
                }

                // CTA
                VStack(spacing: 12) {
                    Text("Ready to take the next step?")
                        .font(.headline)

                    HStack(spacing: 12) {
                        NavigationLink {
                            SolarScoreView()
                        } label: {
                            Label("Check Solar Score", systemImage: "sun.max.fill")
                                .font(.subheadline.bold())
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(AppColors.solarOrange)
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        }

                        NavigationLink {
                            SavingsCalculatorView()
                        } label: {
                            Label("Calculate Savings", systemImage: "dollarsign.circle.fill")
                                .font(.subheadline.bold())
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(AppColors.solarGreen)
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                }
                .cardStyle()
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    private func contentBlock(_ text: String) -> some View {
        Group {
            if text.hasPrefix("**") && text.hasSuffix("**") {
                // Bold heading
                Text(text.replacingOccurrences(of: "**", with: ""))
                    .font(.headline)
                    .padding(.top, 4)
            } else if text.hasPrefix("• ") {
                // Bullet point
                HStack(alignment: .top, spacing: 8) {
                    Text("•")
                        .font(.body)
                        .foregroundStyle(AppColors.solarBlue)
                    Text(text.dropFirst(2))
                        .font(.body)
                        .foregroundStyle(.secondary)
                }
                .padding(.leading, 8)
            } else {
                // Regular paragraph
                Text(text)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func parseContent(_ content: String) -> [String] {
        content
            .components(separatedBy: "\n")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }
}
