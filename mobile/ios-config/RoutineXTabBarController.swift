import UIKit
import WebKit
import Capacitor

/// Native UITabBarController with 4 tabs, each hosting a Capacitor WebView.
/// All tabs share a single WKProcessPool so cookies and auth sessions persist across tabs.
/// This is the #1 Guideline 4.2 differentiator — genuine native UI, not a web-rendered tab bar.
class RoutineXTabBarController: UITabBarController {

    private static let sharedProcessPool = WKProcessPool()

    private let tabs: [(title: String, icon: String, path: String)] = [
        ("Home",    "house.fill",         "/dashboard"),
        ("Analyze", "sparkles",           "/upload"),
        ("Studio",  "person.3.fill",      "/studio/dashboard"),
        ("Profile", "person.circle.fill", "/settings"),
    ]

    override func viewDidLoad() {
        super.viewDidLoad()
        setupAppearance()
        setupTabs()
    }

    private func setupAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(red: 0.094, green: 0.094, blue: 0.106, alpha: 0.95)
        appearance.shadowColor = .clear

        let normalAttrs: [NSAttributedString.Key: Any] = [
            .foregroundColor: UIColor(white: 1.0, alpha: 0.4),
            .font: UIFont.systemFont(ofSize: 10, weight: .semibold),
        ]
        let selectedAttrs: [NSAttributedString.Key: Any] = [
            .foregroundColor: UIColor.white,
            .font: UIFont.systemFont(ofSize: 10, weight: .semibold),
        ]

        appearance.stackedLayoutAppearance.normal.titleTextAttributes = normalAttrs
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = selectedAttrs
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor(white: 1.0, alpha: 0.4)
        appearance.stackedLayoutAppearance.selected.iconColor = .white

        tabBar.standardAppearance = appearance
        tabBar.scrollEdgeAppearance = appearance

        // Gradient accent line at top of tab bar
        let gradient = CAGradientLayer()
        gradient.frame = CGRect(x: 0, y: 0, width: UIScreen.main.bounds.width, height: 1.5)
        gradient.colors = [
            UIColor(red: 0.576, green: 0.2, blue: 0.918, alpha: 0.5).cgColor,  // primary-600
            UIColor(red: 0.925, green: 0.282, blue: 0.6, alpha: 0.5).cgColor,   // accent-500
        ]
        gradient.startPoint = CGPoint(x: 0, y: 0.5)
        gradient.endPoint = CGPoint(x: 1, y: 0.5)
        tabBar.layer.addSublayer(gradient)
    }

    private func setupTabs() {
        var viewControllers: [UIViewController] = []

        for (index, tab) in tabs.enumerated() {
            let vc = RoutineXWebViewController()
            vc.initialPath = tab.path
            vc.sharedProcessPool = Self.sharedProcessPool
            vc.tabBarItem = UITabBarItem(
                title: tab.title,
                image: UIImage(systemName: tab.icon),
                tag: index
            )
            viewControllers.append(vc)
        }

        self.viewControllers = viewControllers
    }
}
