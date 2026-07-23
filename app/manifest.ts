import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "100 Questions",
    short_name: "100 Questions",
    description:
      "Measure brand visibility in web-grounded AI answers across leading providers.",
    start_url: "/",
    display: "standalone",
    background_color: "#070908",
    theme_color: "#070908",
    orientation: "portrait-primary",
    categories: ["business", "analytics", "productivity"],
    icons: [
      {
        src: "/icon-192.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
