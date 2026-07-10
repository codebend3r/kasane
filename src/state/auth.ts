import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "@/api/supabase";

export type AuthStatus = "loading" | "signedIn" | "signedOut";

// Must be listed in the Supabase project's redirect allow-list.
const EMAIL_CONFIRM_REDIRECT = "https://kasane.netlify.app/login";

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
      options: { emailRedirectTo: EMAIL_CONFIRM_REDIRECT },
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
