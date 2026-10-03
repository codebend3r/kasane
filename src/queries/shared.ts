// Staleness windows and helpers shared by every query hook. Every `useQuery`
// in the app lives under `src/queries/`, so its key and cache policy are
// declared once and in one place.

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

/**
 * The `queryFn` branch for a missing input. `enabled` already stops the query
 * from running then, but the function still has to type-check against the
 * nullable value, and this keeps that without a non-null assertion.
 */
export const disabledQuery = (): never => {
  throw new Error("query ran while disabled");
};
