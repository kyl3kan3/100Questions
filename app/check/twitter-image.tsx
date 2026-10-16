import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Does ChatGPT know your startup? Interactive AI visibility preview by 100 Questions";

export const size = {
  width: 1200,
  height: 900,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #070908 0%, #0f1712 55%, #07100b 100%)",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#6ee7b7",
              fontWeight: 700,
            }}
          >
            100 Questions
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              maxWidth: 900,
            }}
          >
            Does ChatGPT know your startup?
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#a1a1aa",
              maxWidth: 820,
            }}
          >
            Instant discovery preview — technical readiness plus sample buyer
            questions. Tap to run the interactive check.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#d4d4d8",
          }}
        >
          <span>100questionsai.com/check</span>
          <span
            style={{
              background: "#6ee7b7",
              color: "#07100b",
              padding: "14px 28px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Play in post
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
