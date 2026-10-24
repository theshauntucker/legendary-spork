/**
 * Share-card markup for /principles.
 * Text matches the page description. Satori (next/og) needs plain flex layout.
 */
export function PrinciplesShareCard() {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#09090B",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 700,
          color: "#F9A8D4",
          fontFamily: "sans-serif",
        }}
      >
        RoutineX
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 68,
          fontWeight: 800,
          color: "#FFFFFF",
          marginTop: 28,
          lineHeight: 1.05,
          fontFamily: "sans-serif",
        }}
      >
        How posts get seen
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          color: "#E4E4E7",
          marginTop: 32,
          lineHeight: 1.4,
          maxWidth: 980,
          fontFamily: "sans-serif",
        }}
      >
        Posts are not given a minimum audience. The feed helper lists
        achievements from people you follow and your studio, newest first. No
        page calls it.
      </div>
    </div>
  );
}
