import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuth } from "@/state/auth";
import { useProgress } from "@/state/progress";
import { usePreferences } from "@/state/preferences";

// Nudges signed-out users to log in so their progress and preferences follow
// them between devices. Local state is never lost either way — the zustand
// stores persist to AsyncStorage regardless — so this is a prompt, not a
// warning.
//
// It fires the first time a signed-out user actually changes something, rather
// than on load, so someone who is only browsing is never interrupted. Once
// dismissed it stays dismissed: the flag is persisted, so it does not come back
// on the next launch.

type State = {
  visible: boolean;
  // Persisted so a dismissal survives a reload.
  dismissed: boolean;
  show: () => void;
  dismiss: () => void;
};

export const useLoginPrompt = create<State>()(
  persist(
    (set) => ({
      visible: false,
      dismissed: false,
      show: () => set((s) => (s.dismissed ? s : { visible: true })),
      dismiss: () => set({ visible: false, dismissed: true }),
    }),
    {
      name: "kasane-login-prompt",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ dismissed: s.dismissed }),
    },
  ),
);

const isSignedOut = (): boolean => useAuth.getState().status === "signedOut";

let started = false;

export const startLoginPrompt = (): void => {
  if (started) return;
  started = true;

  const onLocalChange = (): void => {
    if (isSignedOut()) useLoginPrompt.getState().show();
  };

  useProgress.subscribe(onLocalChange);
  usePreferences.subscribe(onLocalChange);

  // Signing in makes the prompt moot; hide it without burning the dismissal so
  // it can still appear if this device is later used signed out.
  useAuth.subscribe(() => {
    if (!isSignedOut()) useLoginPrompt.setState({ visible: false });
  });
};
