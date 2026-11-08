import { describe, expect, it } from "bun:test";
import { upstreamUrl } from "./mangadexRoutes";

describe("upstreamUrl", () => {
  it("maps the API path onto api.mangadex.org, query included", () => {
    expect(upstreamUrl("/_mdx/manga?title=Naruto&limit=10")).toBe(
      "https://api.mangadex.org/manga?title=Naruto&limit=10",
    );
  });

  it("maps the covers path onto the covers CDN", () => {
    expect(upstreamUrl("/_mdx-covers/m1/a.png.256.jpg")).toBe(
      "https://uploads.mangadex.org/covers/m1/a.png.256.jpg",
    );
  });

  it("leaves every other path to the server", () => {
    expect(upstreamUrl("/series/30011")).toBeNull();
    expect(upstreamUrl("/_mdxish/manga")).toBeNull();
  });
});
