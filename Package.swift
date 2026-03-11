// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SolarBillAnalyzer",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "SolarBillAnalyzer",
            targets: ["SolarBillAnalyzer"]
        )
    ],
    targets: [
        .target(
            name: "SolarBillAnalyzer",
            path: "SolarBillAnalyzer"
        )
    ]
)
