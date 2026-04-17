"use client";

import { Button } from "@/components/ui/Button";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";
import { gradients } from "@/lib/gradients";

export default function DesignPreviewPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 48, display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 40, fontWeight: 700 }}>
        <GradientText gradient="sunsetText">Coda Design System Preview</GradientText>
      </h1>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button variant="primary">Primary Action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </section>

      <Glass style={{ padding: 24, maxWidth: 420 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Glass Surface</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
          Backdrop-blur + subtle rim shadow. Drop trophies, profile cards, modals in here.
        </p>
      </Glass>

      <div
        className="animate-diamond-shimmer"
        style={{
          height: 64,
          width: 320,
          borderRadius: 16,
          backgroundImage: `${gradients.auraDiamond}, ${gradients.auraDiamond}`,
          backgroundBlendMode: "overlay",
        }}
      />

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 520 }}>
        {(["sunset", "magentaRush", "auraDiamond"] as const).map((g) => (
          <div key={g} style={{ height: 80, borderRadius: 12, backgroundImage: gradients[g] }} />
        ))}
      </section>
    </main>
  );
}
