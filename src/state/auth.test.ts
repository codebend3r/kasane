import { beforeEach, describe, expect, it } from "bun:test";
import { AuthError } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import { useAuth } from "./auth";
// `@/api/supabase` (and the native modules it drags in) is replaced with these
// mocks by the global preload in `test/setup.ts`.
import { authMocks } from "@test/mocks/supabase";

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
    const subscribe = authMocks.onAuthStateChange;
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
    authMocks.signInWithPassword.mockResolvedValue({
      data: { user: fakeUser, session: fakeSession },
      error: null,
    });
    const result = await useAuth.getState().signIn("cj@example.com", "pw");
    expect(result).toBeNull();
  });

  it("signIn returns the error message on failure", async () => {
    authMocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthError("Invalid login credentials"),
    });
    const result = await useAuth.getState().signIn("cj@example.com", "nope");
    expect(result).toBe("Invalid login credentials");
  });

  it("signUp sends a confirmation redirect back to the running origin", async () => {
    const signUp = authMocks.signUp.mockResolvedValue({
      data: { user: fakeUser, session: null },
      error: null,
    });
    const result = await useAuth.getState().signUp("cj@example.com", "pw");
    expect(result).toBeNull();
    expect(signUp).toHaveBeenCalledWith({
      email: "cj@example.com",
      password: "pw",
      options: { emailRedirectTo: expect.stringMatching(/\/login$/) },
    });

    // Regression guard: the redirect used to be hardcoded to a domain that is
    // not the production deployment, which sent every confirmation link to the
    // wrong site.
    const { emailRedirectTo } = signUp.mock.calls[0][0].options ?? {};
    expect(emailRedirectTo).not.toContain("https://kasane.netlify.app");
  });

  it("signOut returns the error message on failure", async () => {
    authMocks.signOut.mockResolvedValue({
      error: new AuthError("Network failure"),
    });
    const result = await useAuth.getState().signOut();
    expect(result).toBe("Network failure");
  });
});
