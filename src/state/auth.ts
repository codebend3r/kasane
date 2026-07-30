import type { Session } from "@supabase/supabase-js";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { create } from "zustand";
import { supabase } from "@/api/supabase";

export type AuthStatus = "loading" | "signedIn" | "signedOut";

// Where Supabase sends users after they click the signup confirmation link.
//
// Derived from the running origin rather than hardcoded, so production, Netlify
// deploy previews, and local dev each send users back to themselves instead of
// to whichever domain happened to be hardcoded. Native has no origin, so it
// uses the `kasane://` deep link from `app.json`.
//
// Every value this produces must be listed in the Supabase project's redirect
// allow-list (Authentication -> URL Configuration). Supabase silently discards
// a `redirect_to` it does not recognise and falls back to the dashboard's Site
// URL, which is how unconfigured projects end up redirecting to localhost.
const emailConfirmRedirect = (): string =>
  Platform.OS === "web"
    ? `${globalThis.location.origin}/login`
    : Linking.createURL("/login");

type State = {
  session: Session | null;
  status: AuthStatus;
  applySession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
};

export const useAuth = create<State>()((set) => ({
  session: null,
  status: "loading",
  applySession: (session) =>
    set({ session, status: session ? "signedIn" : "signedOut" }),
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  },
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: emailConfirmRedirect() },
    });
    return error?.message ?? null;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return error?.message ?? null;
  },
}));

supabase.auth.getSession().then(({ data }) => {
  useAuth.getState().applySession(data.session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuth.getState().applySession(session);
});

export const useAuthStatus = (): AuthStatus => useAuth((s) => s.status);

export const useAuthEmail = (): string | null =>
  useAuth((s) => s.session?.user.email ?? null);
