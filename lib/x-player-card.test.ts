import { describe, expect, it } from "vitest";

import {
  buildChatgptStartupCheckPlayerCardMeta,
  CHATGPT_STARTUP_CHECK_PATH,
  renderXPlayerCardMetaTags,
  X_PLAYER_EMBED_QUERY,
  X_PLAYER_FRAME_ANCESTORS,
  X_PLAYER_HEIGHT,
  X_PLAYER_WIDTH,
  xPlayerFrameSecurityHeaders,
} from "./x-player-card";

describe("X Player Card metadata", () => {
  it("points the player URL at the embed view", () => {
    const meta = buildChatgptStartupCheckPlayerCardMeta();
    expect(meta.embedUrl).toContain(CHATGPT_STARTUP_CHECK_PATH);
    expect(meta.embedUrl).toContain(X_PLAYER_EMBED_QUERY);
    expect(meta.shareUrl).toBe("https://100questionsai.com/check");
    expect(meta.imageUrl).toContain("/check/twitter-image");
  });

  it("renders required twitter player tags", () => {
    const tags = renderXPlayerCardMetaTags(
      buildChatgptStartupCheckPlayerCardMeta(),
    );
    expect(tags.join("\n")).toContain('name="twitter:card" content="player"');
    expect(tags.join("\n")).toContain('name="twitter:player"');
    expect(tags.join("\n")).toContain(`content="${X_PLAYER_WIDTH}"`);
    expect(tags.join("\n")).toContain(`content="${X_PLAYER_HEIGHT}"`);
  });
});

describe("X Player frame security headers", () => {
  it("allows X to frame the share and embed routes", () => {
    const csp = xPlayerFrameSecurityHeaders().find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;
    expect(csp).toContain("frame-ancestors");
    expect(csp).toContain(X_PLAYER_FRAME_ANCESTORS);
  });
});
