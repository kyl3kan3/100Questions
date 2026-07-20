import { ImageResponse } from "next/og";

export const alt =
  "100 Questions — 25 shared questions, four AI models, 100 planned provider answers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 76px",
          color: "#f4f4f5",
          background:
            "radial-gradient(circle at 82% 42%, rgba(110,231,183,.24), transparent 28%), #070908",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "#6ee7b7",
              color: "#07110d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            ?
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>100 Questions</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ color: "#6ee7b7", fontSize: 20, letterSpacing: 3 }}>
            GROUNDED AI VISIBILITY BENCHMARK
          </div>
          <div
            style={{
              maxWidth: 880,
              fontSize: 66,
              lineHeight: 1.02,
              letterSpacing: -3.4,
              fontWeight: 700,
            }}
          >
            See whether AI puts your brand in the answer.
          </div>
          <div style={{ color: "#a1a1aa", fontSize: 25 }}>
            OpenAI · Claude · Gemini · Grok
          </div>
          <div style={{ color: "#a1a1aa", fontSize: 21 }}>
            25 shared questions · 100 planned answers · directional results
          </div>
        </div>
      </div>
    ),
    size,
  );
}
