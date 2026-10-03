import { supabase } from "@/api/supabase";
import { useAuth } from "@/state/auth";
import {
  pickPreferences,
  usePreferences,
  type PreferencesData,
} from "@/state/preferences";
import { useProgress, type ProgressByRoute } from "@/state/progress";
import {
  diffProgress,
  mergePreferences,
  mergeProgress,
  rebuildProgress,
  type ProgressEntry,
  type ProgressSideDelete,
} from "@/state/syncMerge";
import type { Database } from "@/types/supabase";

// Cloud sync for user progress + preferences. The local zustand stores stay the
// immediate source of truth (instant, offline, works logged out); this layer
// reconciles them with Supabase while a session exists:
//   - on login, pull the account's rows and merge them last-write-wins
//   - while signed in, push local changes after a short debounce
//
// Every push sends the difference between the stores and `synced`, a snapshot
// of what the server is known to hold. The snapshot advances only after a
// write succeeds, so a failed write is simply part of the next diff. A pull
// sets it to the rows it just read, so writing the merged result back into
// the stores pushes exactly the entries where this device was newer — and
// the server's own rows are never echoed back.
// Writes never block the UI and failures are non-fatal — the local copy holds.

const PUSH_DEBOUNCE_MS = 800;

type Synced = {
  userId: string;
  progress: ProgressByRoute;
  /** Null when the account has no preferences row yet. */
  preferences: PreferencesData | null;
};

type ProgressRow = Database["public"]["Tables"]["user_progress"]["Row"];
type PreferencesRow = Database["public"]["Tables"]["user_preferences"]["Row"];

let started = false;
let synced: Synced | null = null;
let progressTimer: ReturnType<typeof setTimeout> | null = null;
let preferencesTimer: ReturnType<typeof setTimeout> | null = null;

const isoFor = (updatedAt: number): string => new Date(updatedAt).toISOString();

// The `side` column is text; rows with any other value are dropped.
const toProgressEntry = (
  r: Pick<ProgressRow, "route_id" | "side" | "position" | "updated_at">,
): ProgressEntry[] =>
  r.side === "anime" || r.side === "manga"
    ? [
        {
          routeId: r.route_id,
          side: r.side,
          position: r.position,
          updatedAt: Date.parse(r.updated_at),
        },
      ]
    : [];

const toPreferences = (
  r: Pick<PreferencesRow, "japanese" | "hidden_genres" | "updated_at">,
): PreferencesData => ({
  japanese: r.japanese,
  hiddenGenres: r.hidden_genres,
  updatedAt: Date.parse(r.updated_at),
});

const upsertProgress = async (
  uid: string,
  rows: readonly ProgressEntry[],
): Promise<boolean> => {
  if (rows.length === 0) return true;
  const { error } = await supabase.from("user_progress").upsert(
    rows.map((r) => ({
      user_id: uid,
      route_id: r.routeId,
      side: r.side,
      position: r.position,
      updated_at: isoFor(r.updatedAt),
    })),
  );
  if (error) console.warn("[sync] progress upsert failed:", error.message);
  return !error;
};

const deleteProgress = async (
  uid: string,
  rows: readonly ProgressSideDelete[],
): Promise<boolean> => {
  const results = await Promise.all(
    rows.map(async (r) => {
      const { error } = await supabase
        .from("user_progress")
        .delete()
        .match({ user_id: uid, route_id: r.routeId, side: r.side });
      if (error) console.warn("[sync] progress delete failed:", error.message);
      return !error;
    }),
  );
  return results.every(Boolean);
};

const upsertPreferences = async (
  uid: string,
  prefs: PreferencesData,
): Promise<boolean> => {
  const { error } = await supabase.from("user_preferences").upsert({
    user_id: uid,
    japanese: prefs.japanese,
    hidden_genres: prefs.hiddenGenres,
    // A device that never edited a preference is at 0; stamp the first upload
    // with now rather than 1970.
    updated_at: isoFor(prefs.updatedAt || Date.now()),
  });
  if (error) console.warn("[sync] preferences upsert failed:", error.message);
  return !error;
};

/** Records that the server now holds `patch`, unless the session moved on. */
const advance = (userId: string, patch: Partial<Omit<Synced, "userId">>) => {
  if (synced?.userId === userId) synced = { ...synced, ...patch };
};

const pushProgress = async (): Promise<void> => {
  if (!synced) return;
  const { userId, progress } = synced;
  const current = useProgress.getState().byRouteId;
  const { upserts, deletes } = diffProgress(progress, current);
  if (upserts.length === 0 && deletes.length === 0) return;
  const [upserted, deleted] = await Promise.all([
    upsertProgress(userId, upserts),
    deleteProgress(userId, deletes),
  ]);
  if (upserted && deleted) advance(userId, { progress: current });
};

const pushPreferences = async (): Promise<void> => {
  if (!synced) return;
  const { userId, preferences } = synced;
  const current = pickPreferences(usePreferences.getState());
  if (preferences?.updatedAt === current.updatedAt) return;
  if (await upsertPreferences(userId, current)) {
    advance(userId, { preferences: current });
  }
};

const pull = async (uid: string): Promise<void> => {
  const [progressRes, preferencesRes] = await Promise.all([
    supabase
      .from("user_progress")
      .select("route_id, side, position, updated_at")
      .eq("user_id", uid),
    supabase
      .from("user_preferences")
      .select("japanese, hidden_genres, updated_at")
      .eq("user_id", uid)
      .maybeSingle(),
  ]);

  if (synced?.userId !== uid) return; // session changed while the fetch was in flight

  if (!progressRes.error) {
    const remote = progressRes.data.flatMap(toProgressEntry);
    advance(uid, { progress: rebuildProgress(remote) });
    useProgress.setState({
      byRouteId: mergeProgress(useProgress.getState().byRouteId, remote),
    });
  }
  if (!preferencesRes.error) {
    const remote = preferencesRes.data
      ? toPreferences(preferencesRes.data)
      : null;
    advance(uid, { preferences: remote });
    usePreferences.setState(
      mergePreferences(pickPreferences(usePreferences.getState()), remote),
    );
  }
};

const onAuthChange = (): void => {
  const nextUserId = useAuth.getState().session?.user.id ?? null;
  if (nextUserId === (synced?.userId ?? null)) return;
  if (!nextUserId) {
    // Signed out: keep local data, just stop syncing.
    synced = null;
    return;
  }
  // Until the pull lands, treat this device's data as already on the server,
  // so an edit made meanwhile pushes only itself.
  synced = {
    userId: nextUserId,
    progress: useProgress.getState().byRouteId,
    preferences: pickPreferences(usePreferences.getState()),
  };
  void pull(nextUserId);
};

export const startCloudSync = (): void => {
  if (started) return;
  started = true;

  useAuth.subscribe(onAuthChange);

  useProgress.subscribe(() => {
    if (!synced) return;
    if (progressTimer) clearTimeout(progressTimer);
    progressTimer = setTimeout(() => void pushProgress(), PUSH_DEBOUNCE_MS);
  });

  usePreferences.subscribe(() => {
    if (!synced) return;
    if (preferencesTimer) clearTimeout(preferencesTimer);
    preferencesTimer = setTimeout(
      () => void pushPreferences(),
      PUSH_DEBOUNCE_MS,
    );
  });

  // Catch a session that resolved before we subscribed.
  onAuthChange();
};
