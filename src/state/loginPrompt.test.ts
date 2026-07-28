jest.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: (k: string) => Promise.resolve(store.get(k) ?? null),
      setItem: (k: string, v: string) => {
        store.set(k, v);
        return Promise.resolve();
      },
      removeItem: (k: string) => {
        store.delete(k);
        return Promise.resolve();
      },
    },
  };
});

jest.mock("@/api/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

import { startLoginPrompt, useLoginPrompt } from "@/state/loginPrompt";
import { useAuth } from "@/state/auth";
import { useProgress } from "@/state/progress";
import { usePreferences } from "@/state/preferences";

const signedOut = () =>
  useAuth.setState({ session: null, status: "signedOut" });

beforeAll(() => {
  startLoginPrompt();
});

beforeEach(() => {
  // Reset the stores the prompt subscribes to first — writing them fires the
  // subscription — then clear the prompt so each test starts hidden.
  useProgress.setState({ byRouteId: {} });
  signedOut();
  useLoginPrompt.setState({ visible: false, dismissed: false });
});

describe("login prompt", () => {
  it("stays hidden until the user actually changes something", () => {
    expect(useLoginPrompt.getState().visible).toBe(false);
  });

  it("appears when a signed-out user marks progress", () => {
    useProgress.getState().setSide(16498, "anime", 12);
    expect(useLoginPrompt.getState().visible).toBe(true);
  });

  it("appears when a signed-out user changes a preference", () => {
    usePreferences.getState().toggleJapanese();
    expect(useLoginPrompt.getState().visible).toBe(true);
  });

  it("does not appear while signed in", () => {
    useAuth.setState({
      // Only `status` is read by the prompt.
      session: null,
      status: "signedIn",
    });
    useProgress.getState().setSide(16498, "anime", 3);
    expect(useLoginPrompt.getState().visible).toBe(false);
  });

  it("stays dismissed for later changes once the user dismisses it", () => {
    useProgress.getState().setSide(16498, "anime", 1);
    expect(useLoginPrompt.getState().visible).toBe(true);

    useLoginPrompt.getState().dismiss();
    expect(useLoginPrompt.getState().visible).toBe(false);

    useProgress.getState().setSide(21, "manga", 5);
    usePreferences.getState().toggleJapanese();
    expect(useLoginPrompt.getState().visible).toBe(false);
  });

  it("hides on sign-in without spending the dismissal", () => {
    useProgress.getState().setSide(16498, "anime", 1);
    expect(useLoginPrompt.getState().visible).toBe(true);

    useAuth.setState({ session: null, status: "signedIn" });
    expect(useLoginPrompt.getState().visible).toBe(false);
    expect(useLoginPrompt.getState().dismissed).toBe(false);

    // Signed out again on the same device, it can still prompt.
    signedOut();
    useProgress.getState().setSide(21, "manga", 2);
    expect(useLoginPrompt.getState().visible).toBe(true);
  });
});
