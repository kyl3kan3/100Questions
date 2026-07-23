import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
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
