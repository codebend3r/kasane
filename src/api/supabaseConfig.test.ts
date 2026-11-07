import { describe, expect, it } from "bun:test";
import {
  PRODUCTION_SUPABASE_PUBLISHABLE_KEY,
  PRODUCTION_SUPABASE_URL,
  resolveSupabaseTarget,
} from "./supabaseConfig";

describe("PRODUCTION_SUPABASE_PUBLISHABLE_KEY", () => {
  // This module is imported by the client bundle and by `scripts/`, so a
  // secret pasted here would ship to every browser. Only the publishable key
  // format is allowed.
  it("is a publishable key, never a secret or service-role key", () => {
    expect(
      PRODUCTION_SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_"),
    ).toBe(true);
  });
});

describe("PRODUCTION_SUPABASE_URL", () => {
  it("points at the project over https", () => {
    expect(PRODUCTION_SUPABASE_URL).toBe(
      "https://obtgldkascmxbtpnvscn.supabase.co",
    );
  });
});

describe("resolveSupabaseTarget", () => {
  const production = {
    url: PRODUCTION_SUPABASE_URL,
    publishableKey: PRODUCTION_SUPABASE_PUBLISHABLE_KEY,
  };

  it("uses production when no override is set", () => {
    expect(
      resolveSupabaseTarget({ url: undefined, publishableKey: undefined }),
    ).toEqual(production);
  });

  it("uses the override when both values are set", () => {
    expect(
      resolveSupabaseTarget({
        url: "http://127.0.0.1:54321",
        publishableKey: "sb_publishable_local",
      }),
    ).toEqual({
      url: "http://127.0.0.1:54321",
      publishableKey: "sb_publishable_local",
    });
  });

  it("never pairs a local URL with the production key", () => {
    expect(
      resolveSupabaseTarget({
        url: "http://127.0.0.1:54321",
        publishableKey: undefined,
      }),
    ).toEqual(production);
    expect(
      resolveSupabaseTarget({ url: undefined, publishableKey: "sb_local" }),
    ).toEqual(production);
  });

  it("treats empty strings as unset", () => {
    expect(resolveSupabaseTarget({ url: "", publishableKey: "" })).toEqual(
      production,
    );
  });
});
