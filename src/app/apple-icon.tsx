import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1C2A21",
          color: "#F3F1EA",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "-0.05em",
        }}
      >
        g
      </div>
    ),
    { ...size }
  );
}
