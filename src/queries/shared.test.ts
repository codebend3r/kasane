import { describe, expect, it } from "bun:test";
import { DAY_MS, HOUR_MS, MINUTE_MS, WEEK_MS, disabledQuery } from "./shared";

describe("disabledQuery", () => {
  // Reaching it means a hook's `enabled` guard and its `queryFn` disagree.
  it("throws rather than fetching with a missing input", () => {
    expect(disabledQuery).toThrow("query ran while disabled");
  });
});

describe("staleness windows", () => {
  it("build up from one minute", () => {
    expect([MINUTE_MS, HOUR_MS, DAY_MS, WEEK_MS]).toEqual([
      60_000, 3_600_000, 86_400_000, 604_800_000,
    ]);
  });
});
