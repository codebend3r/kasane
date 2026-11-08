import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { MANGADEX_USER_AGENT, upstreamUrl } from "@/data/mangadexRoutes";
import { proxyMangaDex } from "@scripts/mangadexProxy";

describe("proxyMangaDex", () => {
  // Real Node request and response objects, unattached to a socket, so the
  // handler is exercised through the same API the servers give it.
  const exchange = (url: string) => {
    const req = new IncomingMessage(new Socket());
    req.url = url;
    return {
      req,
      res: new ServerResponse(req),
      upstreamUrl,
      userAgent: MANGADEX_USER_AGENT,
    };
  };

  const fetchSpy = spyOn(globalThis, "fetch");

  afterEach(() => {
    fetchSpy.mockReset();
  });

  it("forwards with the non-browser User-Agent and relays the reply", async () => {
    fetchSpy.mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "x" },
      }),
    );
    const options = exchange("/_mdx/manga?title=Naruto");

    await expect(proxyMangaDex(options)).resolves.toBe(true);

    expect(fetchSpy.mock.calls[0]?.[0]).toBe(
      "https://api.mangadex.org/manga?title=Naruto",
    );
    expect(fetchSpy.mock.calls[0]?.[1]?.headers).toEqual({
      "User-Agent": MANGADEX_USER_AGENT,
    });
    expect(options.res.statusCode).toBe(200);
    expect(options.res.getHeader("content-type")).toBe("application/json");
    expect(options.res.getHeader("cache-control")).toBe("x");
  });

  it("answers 502 when MangaDex cannot be reached", async () => {
    fetchSpy.mockRejectedValue(new Error("offline"));
    const options = exchange("/_mdx-covers/m1/a.png");

    await expect(proxyMangaDex(options)).resolves.toBe(true);

    expect(options.res.statusCode).toBe(502);
  });

  it("leaves a request outside the proxy paths untouched", async () => {
    const options = exchange("/series/30011");

    await expect(proxyMangaDex(options)).resolves.toBe(false);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(options.res.headersSent).toBe(false);
  });
});
