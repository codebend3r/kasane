import { create } from "zustand";

export const MENU_LINKS: readonly {
  href: "/mapped" | "/my-shows" | "/settings";
  label: string;
  hint: string;
}[] = [
  {
    href: "/mapped",
    label: "All mapped",
    hint: "Every series with an episode ↔ chapter map",
  },
  { href: "/my-shows", label: "My shows", hint: "What you're tracking" },
  { href: "/settings", label: "Settings", hint: "Preferences and account" },
];

type State = {
  open: boolean;
  openMenu: () => void;
  close: () => void;
};

// Deliberately not persisted — the drawer should never be open on launch.
export const useSideMenu = create<State>()((set) => ({
  open: false,
  openMenu: () => set({ open: true }),
  close: () => set({ open: false }),
}));
