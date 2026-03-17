import { ImageResponse } from "next/og";

export const alt = "RoutineX — AI Dance Competition Scoring";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #0f0f1a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.15)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "30%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.1)",
            filter: "blur(80px)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: "#7c3aed" }}>Routine</span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#f59e0b",
            }}
          >
            X
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 900,
            marginBottom: 20,
          }}
        >
          AI-Powered Dance Competition Scoring
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 700,
            marginBottom: 32,
          }}
        >
          3 Expert AI Judges. 300-Point Scale. Instant Feedback.
        </div>

        {/* Award levels */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Gold", color: "#d97706" },
            { label: "High Gold", color: "#eab308" },
            { label: "Platinum", color: "#94a3b8" },
            { label: "Platinum Star", color: "#8b5cf6" },
            { label: "Titanium", color: "#c4a24e" },
          ].map((level) => (
            <div
              key={level.label}
              style={{
                background: `${level.color}22`,
                border: `2px solid ${level.color}55`,
                borderRadius: 30,
                padding: "8px 20px",
                fontSize: 16,
                fontWeight: 700,
                color: level.color,
              }}
            >
              {level.label}
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 18,
            color: "#64748b",
          }}
        >
          routinex.org — Know your score before competition day
        </div>
      </div>
    ),
    { ...size }
  );
}
