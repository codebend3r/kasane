import { describe, expect, it } from "bun:test";
import { disabledQuery } from "./shared";

describe("disabledQuery", () => {
  // Reaching it means a hook's `enabled` guard and its `queryFn` disagree.
  it("throws rather than fetching with a missing input", () => {
    expect(disabledQuery).toThrow("query ran while disabled");
  });
});
