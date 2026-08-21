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

// `@/state/auth` subscribes at module scope, i.e. once per process on first
// import. Recording subscribers here rather than reading `mock.calls` keeps
// that observable to a test no matter when the shared call history is cleared.
export const authSubscribers: AuthStateCallback[] = [];

export const authMocks = {
  getSession: mock<() => Promise<{ data: { session: Session | null } }>>(() =>
    Promise.resolve({ data: { session: null } }),
  ),
  onAuthStateChange: mock<
    (callback: AuthStateCallback) => {
      data: { subscription: { unsubscribe: () => void } };
    }
  >((callback) => {
    authSubscribers.push(callback);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }),
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

type TableResponse = { data: unknown[]; error: null };

type SelectResult = Promise<TableResponse> & {
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => Promise<TableResponse>;
};

type SelectBuilder = { select: (columns: string) => SelectResult };

// Query-builder stub for `supabase.from(...)`: awaitable directly after
// `select` and after `order`, matching the two shapes `fetchCatalog` uses. A
// real promise carries the `order` method, so nothing hand-rolls `then`.
export const tableOf = (rows: unknown[]): SelectBuilder => {
  const respond = (): Promise<TableResponse> =>
    Promise.resolve({ data: rows, error: null });
  return {
    select: () => Object.assign(respond(), { order: () => respond() }),
  };
};

export const fromMock = mock<(table: string) => SelectBuilder>(() => {
  throw new Error(
    "unexpected supabase query — set an implementation on fromMock",
  );
});

export const supabaseMock = { auth: authMocks, from: fromMock };
