import SwiftUI

struct SolarScoreGaugeView: View {
    let score: Int
    let animated: Bool

    @State private var animatedScore: Double = 0

    private var displayScore: Double {
        animated ? animatedScore : Double(score)
    }

    private var scoreColor: Color {
        switch score {
        case 80...100: return AppColors.scoreExcellent
        case 60..<80: return AppColors.scoreGood
        case 40..<60: return AppColors.scoreFair
        case 20..<40: return AppColors.scoreBelowAverage
        default: return AppColors.scorePoor
        }
    }

    private var scoreLabel: String {
        switch score {
        case 80...100: return "Excellent"
        case 60..<80: return "Good"
        case 40..<60: return "Fair"
        case 20..<40: return "Below Average"
        default: return "Poor"
        }
    }

    init(score: Int, animated: Bool = true) {
        self.score = score
        self.animated = animated
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Background arc
                Circle()
                    .trim(from: 0.0, to: 0.75)
                    .stroke(Color.secondary.opacity(0.15), style: StrokeStyle(lineWidth: 20, lineCap: .round))
                    .rotationEffect(.degrees(135))

                // Score arc
                Circle()
                    .trim(from: 0.0, to: 0.75 * (displayScore / 100.0))
                    .stroke(
                        AngularGradient(
                            gradient: Gradient(colors: [AppColors.scorePoor, AppColors.scoreFair, AppColors.scoreGood, AppColors.scoreExcellent]),
                            center: .center,
                            startAngle: .degrees(135),
                            endAngle: .degrees(135 + 270)
                        ),
                        style: StrokeStyle(lineWidth: 20, lineCap: .round)
                    )
                    .rotationEffect(.degrees(135))

                // Center content
                VStack(spacing: 4) {
                    Text("\(Int(displayScore))")
                        .font(.system(size: 56, weight: .bold, design: .rounded))
                        .foregroundStyle(scoreColor)
                        .contentTransition(.numericText())

                    Text(scoreLabel)
                        .font(.headline)
                        .foregroundStyle(scoreColor)

                    Text("Solar Score")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 220, height: 220)
            .padding(.bottom, -30) // Compensate for the bottom gap in the arc
        }
        .onAppear {
            if animated {
                withAnimation(.easeOut(duration: 1.5)) {
                    animatedScore = Double(score)
                }
            }
        }
        .onChange(of: score) { _, newValue in
            if animated {
                withAnimation(.easeOut(duration: 1.0)) {
                    animatedScore = Double(newValue)
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Solar score: \(score) out of 100, rated \(scoreLabel)")
    }
}

#Preview {
    VStack(spacing: 40) {
        SolarScoreGaugeView(score: 82)
        SolarScoreGaugeView(score: 45)
    }
}
