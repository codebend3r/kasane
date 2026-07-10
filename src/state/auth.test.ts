import { AuthError } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import { useAuth } from "./auth";
import { supabase } from "@/api/supabase";

jest.mock("@/api/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

const fakeUser: User = {
  id: "user-1",
  aud: "authenticated",
  email: "cj@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

const fakeSession: Session = {
  access_token: "access",
  refresh_token: "refresh",
  expires_in: 3600,
  token_type: "bearer",
  user: fakeUser,
};

beforeEach(() => {
  useAuth.setState({ session: null, status: "loading" });
});

describe("applySession", () => {
  it("marks a session as signed in", () => {
    useAuth.getState().applySession(fakeSession);
    expect(useAuth.getState().status).toBe("signedIn");
    expect(useAuth.getState().session).toBe(fakeSession);
  });

  it("marks a null session as signed out", () => {
    useAuth.getState().applySession(null);
    expect(useAuth.getState().status).toBe("signedOut");
    expect(useAuth.getState().session).toBeNull();
  });
});

describe("auth state subscription", () => {
  it("routes onAuthStateChange sessions into the store", () => {
    const subscribe = jest.mocked(supabase.auth.onAuthStateChange);
    expect(subscribe).toHaveBeenCalledTimes(1);

    const callback = subscribe.mock.calls[0][0];
    callback("SIGNED_IN", fakeSession);
    expect(useAuth.getState().status).toBe("signedIn");

    callback("SIGNED_OUT", null);
    expect(useAuth.getState().status).toBe("signedOut");
  });
});

describe("actions", () => {
  it("signIn returns null on success", async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: fakeUser, session: fakeSession },
      error: null,
    });
    const result = await useAuth.getState().signIn("cj@example.com", "pw");
    expect(result).toBeNull();
  });

  it("signIn returns the error message on failure", async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthError("Invalid login credentials"),
    });
    const result = await useAuth.getState().signIn("cj@example.com", "nope");
    expect(result).toBe("Invalid login credentials");
  });

  it("signUp sends the email confirmation redirect", async () => {
    const signUp = jest.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: fakeUser, session: null },
      error: null,
    });
    const result = await useAuth.getState().signUp("cj@example.com", "pw");
    expect(result).toBeNull();
    expect(signUp).toHaveBeenCalledWith({
      email: "cj@example.com",
      password: "pw",
      options: { emailRedirectTo: "https://kasane.netlify.app/login" },
    });
  });

  it("signOut returns the error message on failure", async () => {
    jest.mocked(supabase.auth.signOut).mockResolvedValue({
      error: new AuthError("Network failure"),
    });
    const result = await useAuth.getState().signOut();
    expect(result).toBe("Network failure");
  });
});
