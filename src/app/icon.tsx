import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0f0f1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
            backgroundClip: "text",
            color: "#7c3aed",
          }}
        >
          Rx
        </span>
      </div>
    ),
    { ...size }
  );
}
