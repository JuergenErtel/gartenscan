import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          borderRadius: 6,
        }}
      >
        g
      </div>
    ),
    { ...size }
  );
}
