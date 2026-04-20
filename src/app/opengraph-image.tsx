import { ImageResponse } from "next/og";

export const alt = "gartenscan – Dein Garten, einfach verstanden.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: 80,
          background:
            "linear-gradient(135deg, #1C2A21 0%, #2F4635 55%, #3F5B46 100%)",
          color: "#F3F1EA",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              background: "#F3F1EA",
              color: "#1C2A21",
              fontSize: 52,
              fontWeight: 700,
              borderRadius: 16,
              letterSpacing: "-0.05em",
            }}
          >
            g
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>
            gartenscan
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Dein Garten, einfach verstanden.
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#C7D1B9",
            marginTop: 24,
          }}
        >
          Pflanzen · Unkraut · Schädlinge · Krankheiten erkennen
        </div>
      </div>
    ),
    { ...size }
  );
}
