import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Publishable key — safe to ship in the client bundle.
const SUPABASE_URL = "https://obtgldkascmxbtpnvscn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4z9kuzXtE3PeVgbPDtQUWw_cSrKxsu-";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Native apps must pause token refresh while backgrounded; on web the SDK
// already handles visibility itself.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
