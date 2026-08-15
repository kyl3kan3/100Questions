import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

import { AGENT_DISCOVERY_LINK_HEADER } from "./lib/agent-discovery";
import { ALL_PUBLIC_MARKDOWN_PAGES } from "./lib/public-markdown";
import { PUBLIC_ROUTE_REDIRECTS } from "./lib/seo";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Link", value: AGENT_DISCOVERY_LINK_HEADER },
          { key: "Vary", value: "Accept" },
        ],
      },
      ...ALL_PUBLIC_MARKDOWN_PAGES.filter((page) => page.htmlPath !== "/").map((page) => ({
        source: page.htmlPath,
        headers: [
          {
            key: "Link",
            value:
              "<" +
              page.markdownPath +
              '>; rel="alternate"; type="text/markdown"',
          },
          { key: "Vary", value: "Accept" },
        ],
      })),
    ];
  },
  async redirects() {
    return PUBLIC_ROUTE_REDIRECTS.map((redirect) => ({ ...redirect }));
  },
  outputFileTracingIncludes: {
    "/api/runs/*/export": [
      "./node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2",
      "./node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff2",
      "./node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff2",
      "./node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-700-normal.woff2",
      "./node_modules/@fontsource/noto-emoji/files/noto-emoji-emoji-400-normal.woff2",
      "./node_modules/@fontsource/noto-emoji/files/noto-emoji-emoji-700-normal.woff2",
      "./node_modules/@fontsource/unifont/files/unifont-latin-400-normal.woff2",
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default withWorkflow(nextConfig);
