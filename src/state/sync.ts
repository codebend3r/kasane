import { supabase } from "@/api/supabase";
import { useAuth } from "@/state/auth";
import { useProgress } from "@/state/progress";
import { usePreferences } from "@/state/preferences";
import {
  diffProgress,
  mergePreferences,
  mergeProgress,
  type LocalPreferences,
  type ProgressByRoute,
  type ProgressEntry,
  type ProgressSideDelete,
  type RemoteProgressRow,
} from "@/state/syncMerge";

// Cloud sync for user progress + preferences. The local zustand stores stay the
// immediate source of truth (instant, offline, works logged out); this layer
// reconciles them with Supabase when a session exists:
//   - pull + last-write-wins merge on login
//   - debounced push of local changes while signed in
// Writes never block the UI and failures are non-fatal — the local copy holds.

const PUSH_DEBOUNCE_MS = 800;

let started = false;
let userId: string | null = null;
// While true, store writes come from a pull and must not echo back as pushes.
let applyingRemote = false;
// Server-side snapshot of progress, used to compute minimal upsert/delete diffs.
let lastPushedProgress: ProgressByRoute = {};
let progressTimer: ReturnType<typeof setTimeout> | null = null;
let preferencesTimer: ReturnType<typeof setTimeout> | null = null;

const isoFor = (updatedAt: number): string => new Date(updatedAt).toISOString();

const readLocalPreferences = (): LocalPreferences => {
  const { japanese, hiddenGenres, updatedAt } = usePreferences.getState();
  return { japanese, hiddenGenres, updatedAt };
};

const upsertProgress = async (
  uid: string,
  rows: ProgressEntry[],
): Promise<void> => {
  if (rows.length === 0) return;
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
};

const deleteProgress = async (
  uid: string,
  rows: ProgressSideDelete[],
): Promise<void> => {
  await Promise.all(
    rows.map(async (r) => {
      const { error } = await supabase
        .from("user_progress")
        .delete()
        .match({ user_id: uid, route_id: r.routeId, side: r.side });
      if (error) console.warn("[sync] progress delete failed:", error.message);
    }),
  );
};

const upsertPreferences = async (
  uid: string,
  prefs: LocalPreferences,
): Promise<void> => {
  const { error } = await supabase.from("user_preferences").upsert({
    user_id: uid,
    japanese: prefs.japanese,
    hidden_genres: prefs.hiddenGenres,
    updated_at: isoFor(prefs.updatedAt || Date.now()),
  });
  if (error) console.warn("[sync] preferences upsert failed:", error.message);
};

const pushProgress = async (): Promise<void> => {
  const uid = userId;
  if (!uid) return;
  const current = useProgress.getState().byRouteId;
  const { upserts, deletes } = diffProgress(lastPushedProgress, current);
  lastPushedProgress = current;
  await Promise.all([
    upsertProgress(uid, upserts),
    deleteProgress(uid, deletes),
  ]);
};

const pushPreferences = async (): Promise<void> => {
  const uid = userId;
  if (!uid) return;
  await upsertPreferences(uid, readLocalPreferences());
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

  if (userId !== uid) return; // session changed while the fetch was in flight

  applyingRemote = true;
  try {
    if (!progressRes.error) {
      // The `side` column is text; narrow it to ProgressSide without casting.
      const remoteRows = (progressRes.data ?? []).flatMap(
        (r): RemoteProgressRow[] =>
          r.side === "anime" || r.side === "manga"
            ? [
                {
                  route_id: r.route_id,
                  side: r.side,
                  position: r.position,
                  updated_at: r.updated_at,
                },
              ]
            : [],
      );
      const { merged, toPush } = mergeProgress(
        useProgress.getState().byRouteId,
        remoteRows,
      );
      useProgress.setState({ byRouteId: merged });
      lastPushedProgress = merged;
      await upsertProgress(uid, toPush);
    }
    if (!preferencesRes.error) {
      const { merged, pushLocal } = mergePreferences(
        readLocalPreferences(),
        preferencesRes.data ?? null,
      );
      usePreferences.setState({
        japanese: merged.japanese,
        hiddenGenres: merged.hiddenGenres,
        updatedAt: merged.updatedAt,
      });
      if (pushLocal) await upsertPreferences(uid, merged);
    }
  } finally {
    applyingRemote = false;
  }
};

const onAuthChange = (): void => {
  const nextUserId = useAuth.getState().session?.user.id ?? null;
  if (nextUserId === userId) return;
  userId = nextUserId;
  if (userId) {
    lastPushedProgress = useProgress.getState().byRouteId;
    void pull(userId);
  } else {
    // Signed out: keep local data, just stop syncing.
    lastPushedProgress = {};
  }
};

export const startCloudSync = (): void => {
  if (started) return;
  started = true;

  useAuth.subscribe(onAuthChange);

  useProgress.subscribe(() => {
    if (applyingRemote || !userId) return;
    if (progressTimer) clearTimeout(progressTimer);
    progressTimer = setTimeout(() => void pushProgress(), PUSH_DEBOUNCE_MS);
  });

  usePreferences.subscribe(() => {
    if (applyingRemote || !userId) return;
    if (preferencesTimer) clearTimeout(preferencesTimer);
    preferencesTimer = setTimeout(
      () => void pushPreferences(),
      PUSH_DEBOUNCE_MS,
    );
  });

  // Catch a session that resolved before we subscribed.
  onAuthChange();
};
