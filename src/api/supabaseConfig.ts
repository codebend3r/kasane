// The project's public connection details. Kept apart from `@/api/supabase`,
// which wires in React Native storage, so the bun scripts in `scripts/` can
// share them without pulling in a native module.
//
// The publishable key is committed on purpose: everything in the client bundle
// is public, and row-level security is the boundary. A service-role key must
// never land here.
export const PRODUCTION_SUPABASE_URL =
  "https://obtgldkascmxbtpnvscn.supabase.co";
export const PRODUCTION_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4z9kuzXtE3PeVgbPDtQUWw_cSrKxsu-";

type SupabaseTargetInput = {
  url: string | undefined;
  publishableKey: string | undefined;
};

type SupabaseTarget = {
  url: string;
  publishableKey: string;
};

// `scripts/dev.sh local` sets both overrides to point the dev server at the
// local Supabase stack. Anything less than both falls back to production, so a
// half-set environment can never pair a local URL with the production key.
export function resolveSupabaseTarget({
  url,
  publishableKey,
}: SupabaseTargetInput): SupabaseTarget {
  return !!url && !!publishableKey
    ? { url, publishableKey }
    : {
        url: PRODUCTION_SUPABASE_URL,
        publishableKey: PRODUCTION_SUPABASE_PUBLISHABLE_KEY,
      };
}

// Expo inlines `EXPO_PUBLIC_*` only when read with dot access, so these stay
// literal property reads rather than a lookup by name.
const target = resolveSupabaseTarget({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

export const SUPABASE_URL = target.url;
export const SUPABASE_PUBLISHABLE_KEY = target.publishableKey;
