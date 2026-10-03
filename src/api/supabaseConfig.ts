// The project's public connection details. Kept apart from `@/api/supabase`,
// which wires in React Native storage, so the bun scripts in `scripts/` can
// share them without pulling in a native module.
//
// The publishable key is committed on purpose: everything in the client bundle
// is public, and row-level security is the boundary. A service-role key must
// never land here.
export const SUPABASE_URL = "https://obtgldkascmxbtpnvscn.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4z9kuzXtE3PeVgbPDtQUWw_cSrKxsu-";
