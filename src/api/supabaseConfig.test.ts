import { describe, expect, it } from "bun:test";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabaseConfig";

describe("SUPABASE_PUBLISHABLE_KEY", () => {
  // This module is imported by the client bundle and by `scripts/`, so a
  // secret pasted here would ship to every browser. Only the publishable key
  // format is allowed.
  it("is a publishable key, never a secret or service-role key", () => {
    expect(SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")).toBe(true);
  });
});

describe("SUPABASE_URL", () => {
  it("points at the project over https", () => {
    expect(SUPABASE_URL).toBe("https://obtgldkascmxbtpnvscn.supabase.co");
  });
});
