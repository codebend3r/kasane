import { create } from "zustand";

/** Scrolled past this, the home screen drops its chrome for the grid. */
export const IMMERSIVE_ENTER = 48;

/** Back above this, the chrome returns. Lower than the entry point so a
 * small scroll jitter around one threshold cannot flicker the header. */
export const IMMERSIVE_EXIT = 8;

type State = {
  /** The reader is scrolling the home grid: the header shrinks and the
   * search field and filters give way to the covers. */
  immersive: boolean;
  /** Enters or leaves immersive mode for the grid's scroll offset. */
  trackOffset: (offset: number) => void;
  /** Leaving the grid restores the full chrome. */
  reset: () => void;
};

// Not persisted: every launch opens on the full home screen.
export const useHomeChrome = create<State>()((set) => ({
  immersive: false,
  trackOffset: (offset) =>
    set(({ immersive }) => ({
      immersive: immersive ? offset > IMMERSIVE_EXIT : offset > IMMERSIVE_ENTER,
    })),
  reset: () => set({ immersive: false }),
}));
