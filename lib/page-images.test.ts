import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ARTICLE_IMAGES, getArticleImage } from "./page-images";

describe("page-specific article images", () => {
  it("ships compressed, described images for the priority evidence guides", () => {
    expect(Object.keys(ARTICLE_IMAGES)).toEqual([
      "/aeo-vs-geo",
      "/generative-engine-optimization",
      "/llm-seo",
      "/ai-visibility",
      "/how-to-measure-ai-search-visibility",
    ]);

    for (const [path, image] of Object.entries(ARTICLE_IMAGES)) {
      const file = join(process.cwd(), "public", image.path.slice(1));
      expect(existsSync(file), path).toBe(true);
      expect(statSync(file).size, path).toBeLessThan(100 * 1024);
      expect(image.alt.length, path).toBeGreaterThan(40);
      expect(image.caption.length, path).toBeGreaterThan(40);
      expect(getArticleImage(path)).toMatchObject({
        url: `https://100questionsai.com${image.path}`,
        width: 1200,
        height: 675,
      });
    }
  });
});
