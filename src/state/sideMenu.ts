import { create } from "zustand";

export type MenuSection = "mapped" | "myShows" | "settings";

export const MENU_SECTIONS: readonly {
  id: MenuSection;
  label: string;
}[] = [
  { id: "mapped", label: "All mapped" },
  { id: "myShows", label: "My shows" },
  { id: "settings", label: "Settings" },
];

type State = {
  open: boolean;
  section: MenuSection;
  openMenu: (section?: MenuSection) => void;
  close: () => void;
  setSection: (section: MenuSection) => void;
};

// Deliberately not persisted — the drawer should never be open on launch.
export const useSideMenu = create<State>()((set) => ({
  open: false,
  section: "mapped",
  openMenu: (section) =>
    set(section ? { open: true, section } : { open: true }),
  close: () => set({ open: false }),
  setSection: (section) => set({ section }),
}));
