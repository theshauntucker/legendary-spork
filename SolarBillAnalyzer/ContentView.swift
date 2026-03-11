import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            BillInputSelectionView()
                .tabItem {
                    Label("Bills", systemImage: "doc.text.fill")
                }
                .tag(1)

            NavigationStack {
                SolarScoreView()
            }
            .tabItem {
                Label("Solar", systemImage: "sun.max.fill")
            }
            .tag(2)

            NavigationStack {
                EducationHubView()
            }
            .tabItem {
                Label("Learn", systemImage: "book.fill")
            }
            .tag(3)
        }
        .tint(AppColors.primary)
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [Bill.self, SolarProfile.self], inMemory: true)
}
