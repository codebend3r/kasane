import { beforeEach, describe, expect, it } from "bun:test";
import { MENU_LINKS, useSideMenu } from "./sideMenu";

beforeEach(() => {
  useSideMenu.setState({ open: false });
});

describe("useSideMenu", () => {
  it("starts closed", () => {
    expect(useSideMenu.getState().open).toBe(false);
  });

  it("opens and closes", () => {
    useSideMenu.getState().openMenu();
    expect(useSideMenu.getState().open).toBe(true);
    useSideMenu.getState().close();
    expect(useSideMenu.getState().open).toBe(false);
  });
});

describe("MENU_LINKS", () => {
  it("points every entry at a distinct route", () => {
    const hrefs = MENU_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
