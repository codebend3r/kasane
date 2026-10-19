import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { act } from "react-test-renderer";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { last, renderHook } from "@test/renderHook";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const advance = (ms: number): void => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

describe("useDebouncedValue", () => {
  it("starts at the initial value", () => {
    const { captures, unmount } = renderHook(() => useDebouncedValue("a", 300));
    try {
      expect(last(captures)).toBe("a");
    } finally {
      unmount();
    }
  });

  it("follows a change only once it has held still for the delay", () => {
    // The harness re-runs the same hook closure, so the input is read from here.
    const input = { value: "a" };
    const { captures, rerender, unmount } = renderHook(() =>
      useDebouncedValue(input.value, 300),
    );
    try {
      input.value = "ab";
      rerender();
      advance(299);
      expect(last(captures)).toBe("a");
      advance(1);
      expect(last(captures)).toBe("ab");
    } finally {
      unmount();
    }
  });

  it("restarts the wait on every change", () => {
    const input = { value: "a" };
    const { captures, rerender, unmount } = renderHook(() =>
      useDebouncedValue(input.value, 300),
    );
    try {
      input.value = "ab";
      rerender();
      advance(200);
      input.value = "abc";
      rerender();
      advance(200);
      expect(last(captures)).toBe("a");
      advance(100);
      expect(last(captures)).toBe("abc");
    } finally {
      unmount();
    }
  });
});
