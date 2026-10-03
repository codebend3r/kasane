// `@/api/supabase` is replaced with the shared mocks by the bun test preload in
// `test/setup.ts`; each test serves the two user tables from `server` below.
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  spyOn,
} from "bun:test";
import type { Session } from "@supabase/supabase-js";
import { startCloudSync } from "./sync";
import { useAuth } from "@/state/auth";
import { usePreferences } from "@/state/preferences";
import { useProgress } from "@/state/progress";
import type { Database } from "@/types/supabase";
import { fromMock } from "@test/mocks/supabase";

type Tables = Database["public"]["Tables"];
type ProgressRow = Tables["user_progress"]["Insert"];
type PreferencesRow = Tables["user_preferences"]["Insert"];
type WriteResult = { error: { message: string } | null };

const iso = (ms: number): string => new Date(ms).toISOString();

const session = (userId: string): Session => ({
  access_token: "access",
  refresh_token: "refresh",
  expires_in: 3600,
  token_type: "bearer",
  user: {
    id: userId,
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
  },
});

// The account's rows as the fake server holds them, plus every write the
// controller sent.
const server = {
  progress: new Map<string, ProgressRow>(),
  preferences: null as PreferencesRow | null,
  failWrites: false,
  progressUpserts: [] as ProgressRow[][],
  preferenceUpserts: [] as PreferencesRow[],
  // Resolves the progress read; swapped out by a test that needs to hold it.
  releaseProgressRead: (respond: () => void) => respond(),
};

const rowKey = (r: { route_id: number; side: string }) =>
  `${r.route_id}:${r.side}`;

const written = (): Promise<WriteResult> =>
  Promise.resolve({
    error: server.failWrites ? { message: "offline" } : null,
  });

const serveUserTables = () => {
  fromMock.mockImplementation((table) => {
    if (table === "user_progress") {
      return {
        select: () => ({
          eq: () =>
            new Promise((resolve) =>
              server.releaseProgressRead(() =>
                resolve({ data: [...server.progress.values()], error: null }),
              ),
            ),
        }),
        upsert: (rows: ProgressRow[]) => {
          server.progressUpserts.push(rows);
          if (!server.failWrites) {
            rows.forEach((r) => server.progress.set(rowKey(r), r));
          }
          return written();
        },
        delete: () => ({
          match: (m: { route_id: number; side: string }) => {
            server.progress.delete(rowKey(m));
            return written();
          },
        }),
      };
    }
    if (table === "user_preferences") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: server.preferences, error: null }),
          }),
        }),
        upsert: (row: PreferencesRow) => {
          server.preferenceUpserts.push(row);
          if (!server.failWrites) server.preferences = row;
          return written();
        },
      };
    }
    throw new Error(`no fake for supabase table "${table}"`);
  });
};

// Lets every pending promise chain settle without advancing the clock.
const settle = (): Promise<void> =>
  Array.from({ length: 20 }).reduce<Promise<void>>(
    (p) => p.then(() => Promise.resolve()),
    Promise.resolve(),
  );

/** Runs out the push debounce and lets the writes land. */
const flushPushes = async (): Promise<void> => {
  jest.advanceTimersByTime(1000);
  await settle();
};

const signIn = async (userId: string): Promise<void> => {
  useAuth.getState().applySession(session(userId));
  await settle();
};

beforeAll(() => {
  startCloudSync();
});

beforeEach(async () => {
  jest.useFakeTimers();
  serveUserTables();
  useAuth.getState().applySession(null);
  useProgress.setState({ byRouteId: {} });
  usePreferences.setState({ japanese: false, hiddenGenres: [], updatedAt: 0 });
  server.progress.clear();
  server.preferences = null;
  server.failWrites = false;
  server.progressUpserts = [];
  server.preferenceUpserts = [];
  server.releaseProgressRead = (respond) => respond();
  await settle();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("cloud sync on sign-in", () => {
  it("merges the account's rows into the local stores", async () => {
    server.progress.set("21:anime", {
      user_id: "u1",
      route_id: 21,
      side: "anime",
      position: 10,
      updated_at: iso(1000),
    });
    server.preferences = {
      user_id: "u1",
      japanese: true,
      hidden_genres: ["horror"],
      updated_at: iso(5000),
    };

    await signIn("u1");

    expect(useProgress.getState().byRouteId).toEqual({
      21: { anime: { position: 10, updatedAt: 1000 } },
    });
    expect(usePreferences.getState().japanese).toBe(true);
    expect(usePreferences.getState().hiddenGenres).toEqual(["horror"]);
  });

  it("pushes only the entries this device was newer on", async () => {
    useProgress.setState({
      byRouteId: { 21: { anime: { position: 5, updatedAt: 3000 } } },
    });
    server.progress.set("21:anime", {
      user_id: "u1",
      route_id: 21,
      side: "anime",
      position: 4,
      updated_at: iso(2000),
    });
    server.progress.set("21:manga", {
      user_id: "u1",
      route_id: 21,
      side: "manga",
      position: 9,
      updated_at: iso(4000),
    });

    await signIn("u1");
    await flushPushes();

    expect(server.progressUpserts).toEqual([
      [
        {
          user_id: "u1",
          route_id: 21,
          side: "anime",
          position: 5,
          updated_at: iso(3000),
        },
      ],
    ]);
  });

  it("does not echo newer server preferences back", async () => {
    usePreferences.setState({
      japanese: false,
      hiddenGenres: [],
      updatedAt: 1000,
    });
    server.preferences = {
      user_id: "u1",
      japanese: true,
      hidden_genres: [],
      updated_at: iso(5000),
    };

    await signIn("u1");
    await flushPushes();

    expect(server.preferenceUpserts).toEqual([]);
  });

  it("uploads local preferences when the account has none", async () => {
    usePreferences.setState({
      japanese: true,
      hiddenGenres: [],
      updatedAt: 2000,
    });

    await signIn("u1");
    await flushPushes();

    expect(server.preferenceUpserts).toEqual([
      {
        user_id: "u1",
        japanese: true,
        hidden_genres: [],
        updated_at: iso(2000),
      },
    ]);
  });

  it("still pushes an edit made while the pull was in flight", async () => {
    const held: { respond: (() => void) | null } = { respond: null };
    server.releaseProgressRead = (respond) => {
      held.respond = respond;
    };

    useAuth.getState().applySession(session("u1"));
    await settle();
    useProgress.getState().setSide(30, "manga", 12);
    held.respond?.();
    await settle();
    await flushPushes();

    expect(server.progress.get("30:manga")?.position).toBe(12);
  });
});

describe("cloud sync while signed in", () => {
  it("retries a failed write with the next change", async () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    await signIn("u1");

    server.failWrites = true;
    useProgress.getState().setSide(1, "anime", 3);
    await flushPushes();
    expect(server.progress.size).toBe(0);

    server.failWrites = false;
    useProgress.getState().setSide(2, "manga", 7);
    await flushPushes();

    expect([...server.progress.keys()].sort()).toEqual(["1:anime", "2:manga"]);
    warn.mockRestore();
  });

  it("deletes a cleared side on the server", async () => {
    await signIn("u1");
    useProgress.getState().setSide(1, "anime", 3);
    await flushPushes();
    expect(server.progress.has("1:anime")).toBe(true);

    useProgress.getState().clearSide(1, "anime");
    await flushPushes();

    expect(server.progress.has("1:anime")).toBe(false);
  });

  it("stops syncing after sign-out", async () => {
    await signIn("u1");
    useAuth.getState().applySession(null);
    await settle();

    useProgress.getState().setSide(1, "anime", 3);
    await flushPushes();

    expect(server.progressUpserts).toEqual([]);
  });
});
