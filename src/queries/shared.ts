// Helpers shared by every query hook. Every `useQuery` in the app lives under
// `src/queries/`, so its key and cache policy are declared once and in one
// place. Staleness windows come from `@/data/time`.

/**
 * The `queryFn` branch for a missing input. `enabled` already stops the query
 * from running then, but the function still has to type-check against the
 * nullable value, and this keeps that without a non-null assertion.
 */
export const disabledQuery = (): never => {
  throw new Error("query ran while disabled");
};
