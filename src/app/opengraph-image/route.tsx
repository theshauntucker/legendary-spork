import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(147, 51, 234, 0.12)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(236, 72, 153, 0.1)",
            filter: "blur(80px)",
          }}
        />

        {/* Top gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #9333ea, #ec4899, #f59e0b)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", padding: "80px", position: "relative" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #9333ea, #ec4899, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 800,
                color: "white",
              }}
            >
              R
            </div>
            <span style={{ fontSize: "28px", fontWeight: 700, color: "white", fontFamily: "Arial, sans-serif" }}>
              RoutineX
            </span>
          </div>

          {/* Headline */}
          <div style={{ fontSize: "64px", fontWeight: 800, color: "white", lineHeight: 1.1 }}>
            Your Dancer&apos;s
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              background: "linear-gradient(90deg, #c084fc, #f472b6, #fbbf24)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Secret Weapon
          </div>

          {/* Subheadline */}
          <div style={{ fontSize: "24px", color: "#a1a1aa", marginTop: "24px", fontFamily: "Arial, sans-serif" }}>
            AI-powered video analysis with competition-standard scoring.
          </div>
          <div style={{ fontSize: "24px", color: "#a1a1aa", marginTop: "4px", fontFamily: "Arial, sans-serif" }}>
            Upload any routine. Get detailed feedback in under 5 minutes.
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "36px",
              width: "280px",
              height: "52px",
              borderRadius: "26px",
              background: "linear-gradient(90deg, #9333ea, #ec4899, #f59e0b)",
              fontSize: "20px",
              fontWeight: 700,
              color: "white",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Get Your Free Analysis
          </div>
        </div>

        {/* Bottom info */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "16px",
            color: "#52525b",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span>routinex.org</span>
          <span>First analysis FREE — then from $6/video</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
