import { describe, expect, it } from "bun:test";
import { DAY_MS, HOUR_MS, MINUTE_MS, WEEK_MS } from "./time";

describe("time constants", () => {
  it("build on one another", () => {
    expect(MINUTE_MS).toBe(60_000);
    expect(HOUR_MS).toBe(60 * MINUTE_MS);
    expect(DAY_MS).toBe(24 * HOUR_MS);
    expect(WEEK_MS).toBe(7 * DAY_MS);
  });
});
