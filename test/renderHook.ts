import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Hook harness for anything built on `useQuery`. Renders `hook` inside a fresh
// QueryClient with retries off, capturing every value it emits.
export const renderHook = <T>(hook: () => T) => {
  const captures: T[] = [];
  const Probe = () => {
    captures.push(hook());
    return null;
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const tree = () =>
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(Probe),
    );
  const state: { root: TestRenderer.ReactTestRenderer | null } = { root: null };
  act(() => {
    state.root = TestRenderer.create(tree());
  });
  return {
    captures,
    /** Renders the hook again without changing anything it reads. */
    rerender: () => {
      act(() => {
        state.root?.update(tree());
      });
    },
    unmount: () => {
      act(() => {
        state.root?.unmount();
      });
    },
  };
};

// Ticks the event loop inside act() until `done` reports settled. A macrotask
// is required, not just a microtask flush: react-query settles the second and
// later query instances in a file through a timer.
//
// Throws when it runs out of ticks. Returning quietly would turn "the query
// never resolved" into a confusing assertion diff further down the test.
const SETTLE_TICKS = 20;

export const settle = async (
  done: () => boolean,
  label: string = "the hook to settle",
): Promise<void> => {
  const attempt = async (remaining: number): Promise<void> => {
    if (done()) return;
    if (remaining === 0) {
      throw new Error(
        `timed out after ${SETTLE_TICKS} ticks waiting for ${label}`,
      );
    }
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    });
    return attempt(remaining - 1);
  };
  return attempt(SETTLE_TICKS);
};

export const last = <T>(values: readonly T[]): T => values[values.length - 1];
