import SwiftUI
import SwiftData

@main
struct SolarBillAnalyzerApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Bill.self, SolarProfile.self])
    }
}
