import { mock } from "bun:test";
import { supabaseMock } from "@/api/supabase.mock";

// Global test preload (wired up in `bunfig.toml`). bun evaluates real ESM, so
// unlike jest there is no `jest.mock` hoisting: native-only modules must be
// mocked here, before any test file imports something that pulls them in.
// react-native ships Flow-typed source bun cannot parse at all.

// react-test-renderer's act() refuses to run outside an act-enabled environment.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// React 19 prints a deprecation notice on every TestRenderer.create() call,
// which shreds the dots reporter output. Swallow that one known message and
// pass everything else through untouched.
const consoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const [first] = args;
  if (
    typeof first === "string" &&
    first.startsWith("react-test-renderer is deprecated")
  ) {
    return;
  }
  consoleError(...args);
};

mock.module("react-native", () => ({
  Platform: { OS: "ios" },
  AppState: { addEventListener: () => ({ remove: () => {} }) },
}));

const store = new Map<string, string>();

mock.module("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: (key: string) => Promise.resolve(store.get(key) ?? null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      store.delete(key);
      return Promise.resolve();
    },
    clear: () => {
      store.clear();
      return Promise.resolve();
    },
  },
}));

// `expo-linking` reads the expo-constants manifest to resolve the app's URI
// scheme, which isn't available under bun.
mock.module("expo-linking", () => ({
  createURL: (path: string) => `kasane://${path.replace(/^\//, "")}`,
}));

// All test files share one process and one module registry, so the Supabase
// client is mocked once, globally, with the shared mocks from
// `@/api/supabase.mock`.
mock.module("@/api/supabase", () => ({ supabase: supabaseMock }));
