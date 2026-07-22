import { describe, expect, it } from "vitest";

import { buildAppStoreSuggestion, parseAppStoreListingUrl } from "./app-store-preview";

describe("App Store subject previews", () => {
  it("preserves the app ID and storefront from a listing URL", () => {
    expect(parseAppStoreListingUrl("https://apps.apple.com/gb/app/example/id123456789?platform=iphone")).toEqual({
      id: "123456789",
      country: "gb",
      url: "https://apps.apple.com/gb/app/example/id123456789?platform=iphone",
    });
  });

  it("does not treat a generic App Store URL as an app listing", () => {
    expect(parseAppStoreListingUrl("https://apps.apple.com/us/charts/iphone")).toBeNull();
  });

  it("builds the brief from app metadata rather than storefront metadata", () => {
    const suggestion = buildAppStoreSuggestion({
      trackName: "Example App",
      sellerName: "Example Studio",
      primaryGenreName: "Productivity",
      description: "Organize projects and tasks.",
      trackViewUrl: "https://apps.apple.com/us/app/example/id123456789",
    }, "Example");
    expect(suggestion.description).toBe("Example App is a Productivity app by Example Studio. Organize projects and tasks.");
    expect(suggestion.aliases).toEqual(["Example", "Example App"]);
  });
});
