// AsyncStorage is mocked globally by the bun test preload in `test/setup.ts`.
import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { pickPreferences, usePreferences } from "./preferences";

beforeEach(() => {
  usePreferences.setState({ japanese: false, hiddenGenres: [], updatedAt: 0 });
});

describe("pickPreferences", () => {
  it("keeps only the data fields, never the actions", () => {
    expect(pickPreferences(usePreferences.getState())).toEqual({
      japanese: false,
      hiddenGenres: [],
      updatedAt: 0,
    });
  });
});

describe("usePreferences", () => {
  it("stamps every edit so sync can resolve last-write-wins", () => {
    const now = spyOn(Date, "now").mockReturnValue(1234);
    try {
      usePreferences.getState().toggleJapanese();
      expect(usePreferences.getState().japanese).toBe(true);
      expect(usePreferences.getState().updatedAt).toBe(1234);
    } finally {
      now.mockRestore();
    }
  });

  it("toggles a genre in and out of the hidden set", () => {
    usePreferences.getState().toggleHiddenGenre("horror");
    expect(usePreferences.getState().hiddenGenres).toEqual(["horror"]);
    usePreferences.getState().toggleHiddenGenre("horror");
    expect(usePreferences.getState().hiddenGenres).toEqual([]);
  });

  it("replaces the whole hidden set in one write", () => {
    usePreferences.getState().setHiddenGenres(["horror", "isekai"]);
    expect(usePreferences.getState().hiddenGenres).toEqual([
      "horror",
      "isekai",
    ]);
  });
});
