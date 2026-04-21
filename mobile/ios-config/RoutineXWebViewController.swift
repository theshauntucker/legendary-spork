import UIKit
import WebKit
import Capacitor

/// A Capacitor-powered WebView tab that loads a specific path on routinex.org.
/// Shares a WKProcessPool with all other tabs for cookie/session continuity.
class RoutineXWebViewController: CAPBridgeViewController {

    var initialPath: String = "/dashboard"
    var sharedProcessPool: WKProcessPool?

    private static let baseURL = "https://routinex.org"
    private var hasLoaded = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.039, green: 0.039, blue: 0.039, alpha: 1.0)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if !hasLoaded {
            hasLoaded = true
            loadInitialURL()
        }
    }

    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let config = super.webViewConfiguration(for: instanceConfiguration)
        if let pool = sharedProcessPool {
            config.processPool = pool
        }
        // Allow inline media playback (dance videos)
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        return config
    }

    private func loadInitialURL() {
        guard let url = URL(string: "\(Self.baseURL)\(initialPath)") else { return }
        bridge?.webView?.load(URLRequest(url: url))
    }

    /// Called from JavaScript: window.RoutineX.navigateTo('/some/path')
    func navigateTo(path: String) {
        guard let url = URL(string: "\(Self.baseURL)\(path)") else { return }
        bridge?.webView?.load(URLRequest(url: url))
    }
}
