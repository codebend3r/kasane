import { beforeEach, describe, expect, it } from "bun:test";
import {
  IMMERSIVE_ENTER,
  IMMERSIVE_EXIT,
  useHomeChrome,
} from "@/state/homeChrome";

const immersive = () => useHomeChrome.getState().immersive;
const track = (offset: number) => useHomeChrome.getState().trackOffset(offset);

beforeEach(() => {
  useHomeChrome.getState().reset();
});

describe("useHomeChrome", () => {
  it("starts with the full chrome showing", () => {
    expect(immersive()).toBe(false);
  });

  it("enters only past the entry threshold", () => {
    track(IMMERSIVE_ENTER);
    expect(immersive()).toBe(false);
    track(IMMERSIVE_ENTER + 1);
    expect(immersive()).toBe(true);
  });

  it("stays immersive until back near the top", () => {
    track(IMMERSIVE_ENTER + 1);
    track(IMMERSIVE_ENTER);
    expect(immersive()).toBe(true);
    track(IMMERSIVE_EXIT);
    expect(immersive()).toBe(false);
  });

  it("resets to the full chrome", () => {
    track(IMMERSIVE_ENTER + 1);
    useHomeChrome.getState().reset();
    expect(immersive()).toBe(false);
  });
});
