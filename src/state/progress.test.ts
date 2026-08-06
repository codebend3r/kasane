// AsyncStorage is mocked globally by the bun test preload in `test/setup.ts`.
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useInProgressEntries, useProgress } from "./progress";

const { createElement, useState } = React;

afterEach(() => {
  act(() => {
    useProgress.setState({ byRouteId: {} });
  });
});

describe("useInProgressEntries", () => {
  it("returns a referentially stable array across re-renders when the store has not changed", () => {
    const captures: ReturnType<typeof useInProgressEntries>[] = [];

    const Probe = () => {
      captures.push(useInProgressEntries());
      return null;
    };

    let bump: (n: number) => void = () => {};
    const Wrapper = () => {
      const [, setVersion] = useState(0);
      bump = setVersion;
      return createElement(Probe);
    };

    let root: TestRenderer.ReactTestRenderer | undefined;
    act(() => {
      root = TestRenderer.create(createElement(Wrapper));
    });
    act(() => {
      bump(1);
    });
    act(() => {
      bump(2);
    });

    expect(captures.length).toBeGreaterThanOrEqual(3);
    expect(captures[0]).toBe(captures[1]);
    expect(captures[1]).toBe(captures[2]);

    act(() => {
      root?.unmount();
    });
  });

  it("returns a fresh array (sorted by updatedAt desc) when the store changes", () => {
    const captures: ReturnType<typeof useInProgressEntries>[] = [];

    const Probe = () => {
      captures.push(useInProgressEntries());
      return null;
    };

    let root: TestRenderer.ReactTestRenderer | undefined;
    const nowSpy = spyOn(Date, "now");
    try {
      act(() => {
        root = TestRenderer.create(createElement(Probe));
      });
      nowSpy.mockReturnValue(100);
      act(() => {
        useProgress.getState().setSide(1, "anime", 3);
      });
      nowSpy.mockReturnValue(200);
      act(() => {
        useProgress.getState().setSide(2, "manga", 5);
      });

      const final = captures[captures.length - 1];
      expect(final.map((e) => e.routeId)).toEqual([2, 1]);
      expect(captures[0]).not.toBe(final);
    } finally {
      nowSpy.mockRestore();
      act(() => {
        root?.unmount();
      });
    }
  });
});
