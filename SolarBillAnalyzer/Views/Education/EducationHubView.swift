import SwiftUI

struct EducationalArticle: Codable, Identifiable {
    let id: String
    let title: String
    let category: String
    let icon: String
    let summary: String
    let content: String
}

struct EducationHubView: View {
    @State private var articles: [EducationalArticle] = []
    @State private var selectedCategory: String?
    @State private var searchText = ""

    private var categories: [String] {
        Array(Set(articles.map { $0.category })).sorted()
    }

    private var filteredArticles: [EducationalArticle] {
        var result = articles
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        if !searchText.isEmpty {
            result = result.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.summary.localizedCaseInsensitiveContains(searchText)
            }
        }
        return result
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                searchBar
                categoryFilter
                articlesList
                faqSection
                tipsLink
            }
            .padding()
        }
        .navigationTitle("Learn")
        .onAppear { loadArticles() }
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "book.fill")
                .font(.system(size: 36))
                .foregroundStyle(AppColors.solarBlue)

            Text("Solar Education Hub")
                .font(.title2.bold())

            Text("Everything you need to know about solar energy, your electricity bill, and how to save money")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
            TextField("Search articles...", text: $searchText)
        }
        .padding(10)
        .background(Color(UIColor.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                categoryChip(nil, label: "All")
                ForEach(categories, id: \.self) { category in
                    categoryChip(category, label: category)
                }
            }
        }
    }

    private func categoryChip(_ category: String?, label: String) -> some View {
        let isSelected = selectedCategory == category
        return Button {
            withAnimation { selectedCategory = category }
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

    private var articlesList: some View {
        VStack(spacing: 12) {
            ForEach(filteredArticles) { article in
                NavigationLink {
                    ArticleDetailView(article: article)
                } label: {
                    HStack(spacing: 14) {
                        Image(systemName: article.icon)
                            .font(.title2)
                            .foregroundStyle(AppColors.solarOrange)
                            .frame(width: 40)

                        VStack(alignment: .leading, spacing: 4) {
                            Text(article.title)
                                .font(.headline)
                                .foregroundStyle(.primary)
                                .multilineTextAlignment(.leading)
                            Text(article.summary)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                            Text(article.category)
                                .font(.caption2)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(AppColors.solarBlue.opacity(0.1))
                                .foregroundStyle(AppColors.solarBlue)
                                .clipShape(Capsule())
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .cardStyle()
                }
            }
        }
    }

    private var faqSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Frequently Asked Questions")
                .font(.headline)

            faqItem(q: "How long do solar panels last?", a: "Most solar panels come with 25-year warranties and can produce electricity for 30+ years. Performance degrades about 0.5-1.5% per year.")
            faqItem(q: "Will solar work on my roof?", a: "Solar works best on south-facing roofs with minimal shading. East and west-facing roofs also work well. Use our Solar Score tool to check your potential!")
            faqItem(q: "How much can I save?", a: "The average US homeowner saves $20,000-$40,000 over 25 years with solar. Use our Savings Calculator for a personalized estimate.")
            faqItem(q: "Do I need battery storage?", a: "Not necessarily. Most solar homes stay connected to the grid and use net metering. Batteries are great for backup power and maximizing self-consumption.")
            faqItem(q: "What happens on cloudy days?", a: "Solar panels still produce 25-45% of their rated output on cloudy days. Any shortfall is covered by the grid through net metering.")
        }
        .cardStyle()
    }

    private func faqItem(q: String, a: String) -> some View {
        DisclosureGroup {
            Text(a)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.top, 4)
        } label: {
            Text(q)
                .font(.subheadline.bold())
                .foregroundStyle(.primary)
        }
    }

    private var tipsLink: some View {
        NavigationLink {
            SavingsTipsView()
        } label: {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .font(.title3)
                    .foregroundStyle(AppColors.solarYellow)
                VStack(alignment: .leading) {
                    Text("Energy Saving Tips")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text("Practical ways to reduce your bill today")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.tertiary)
            }
            .cardStyle()
        }
    }

    private func loadArticles() {
        guard let url = Bundle.main.url(forResource: "EducationalContent", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode([EducationalArticle].self, from: data) else {
            // Fallback: create articles inline for when bundle resource isn't available
            articles = createFallbackArticles()
            return
        }
        articles = decoded
    }

    private func createFallbackArticles() -> [EducationalArticle] {
        [
            EducationalArticle(id: "how-solar-works", title: "How Solar Panels Work", category: "Solar Basics", icon: "sun.max.fill", summary: "Understanding photovoltaic technology and how sunlight becomes electricity.", content: "Solar panels convert sunlight into electricity through the photovoltaic effect. Modern panels are 20-22% efficient and last 25-30+ years."),
            EducationalArticle(id: "understanding-bill", title: "Understanding Your Electric Bill", category: "Energy Basics", icon: "doc.text.fill", summary: "Learn what each charge on your utility bill means.", content: "Your bill includes base charges, energy usage charges (often tiered), delivery fees, taxes, and various regulatory fees."),
            EducationalArticle(id: "solar-incentives", title: "Solar Incentives & Tax Credits", category: "Financial", icon: "dollarsign.circle.fill", summary: "Federal and state incentives that reduce solar costs by 30% or more.", content: "The federal Investment Tax Credit (ITC) provides a 30% tax credit on solar installations through 2032."),
            EducationalArticle(id: "solar-myths", title: "Common Solar Myths Debunked", category: "Solar Basics", icon: "xmark.shield.fill", summary: "Separating fact from fiction about residential solar energy.", content: "Solar panels work on cloudy days, costs have dropped 70% since 2010, and panels actually protect and can increase home value."),
        ]
    }
}
