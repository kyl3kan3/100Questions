import { describe, expect, it } from "vitest";

import {
  renderInlineInternalLinks,
  stripInlineInternalLinkMarkers,
} from "./inline-internal-link";

describe("inline internal link markers", () => {
  it("strips markers for plain-text output", () => {
    const source =
      "Baseline and [[/for-agencies|client report]], then rerun.";
    expect(stripInlineInternalLinkMarkers(source)).toBe(
      "Baseline and client report, then rerun.",
    );
  });

  it("leaves strings without markers unchanged", () => {
    const plain = "No markers here.";
    expect(stripInlineInternalLinkMarkers(plain)).toBe(plain);
    expect(renderInlineInternalLinks(plain)).toBe(plain);
  });
});
