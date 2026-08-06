import { mock } from "bun:test";
import type {
  AuthChangeEvent,
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js";

// Typed stand-ins for the Supabase auth surface the app touches. The bun test
// preload (`test/setup.ts`) registers these as the `@/api/supabase` module, so
// every test file shares one instance and can drive them without casts.

type Credentials = {
  email: string;
  password: string;
  options?: { emailRedirectTo?: string };
};

type AuthResult = {
  data: { user: User | null; session: Session | null };
  error: AuthError | null;
};

export type AuthStateCallback = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

export const authMocks = {
  getSession: mock<() => Promise<{ data: { session: Session | null } }>>(() =>
    Promise.resolve({ data: { session: null } }),
  ),
  onAuthStateChange: mock<
    (callback: AuthStateCallback) => {
      data: { subscription: { unsubscribe: () => void } };
    }
  >(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
  signInWithPassword: mock<(credentials: Credentials) => Promise<AuthResult>>(
    () => Promise.resolve({ data: { user: null, session: null }, error: null }),
  ),
  signUp: mock<(credentials: Credentials) => Promise<AuthResult>>(() =>
    Promise.resolve({ data: { user: null, session: null }, error: null }),
  ),
  signOut: mock<() => Promise<{ error: AuthError | null }>>(() =>
    Promise.resolve({ error: null }),
  ),
};

export const supabaseMock = { auth: authMocks };
