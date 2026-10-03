import { useCallback, useState } from "react";
import { suggestPartnerMark } from "@/data/mapping";
import { useProgress } from "@/state/progress";
import type { ProgressSide, SeriesMapping, SidePosition } from "@/types";

/** The mark a reader just made, with what it replaced and what it implies. */
export type MarkEvent = SidePosition & {
  /** The position this mark overwrote, so undo can restore it. */
  previous: number | null;
  /** The matching position on the other side, when it is further along. */
  suggestion: SidePosition | null;
};

const otherSideOf = (side: ProgressSide): ProgressSide =>
  side === "anime" ? "manga" : "anime";

/**
 * Owns progress marking for one series: writes the mark, remembers it for the
 * banner, and applies the banner's undo or suggestion. Views only report
 * where the reader tapped.
 */
export function useMarkProgress({
  routeId,
  mapping,
}: {
  routeId: number;
  mapping: SeriesMapping | null;
}) {
  const setSide = useProgress((s) => s.setSide);
  const clearSide = useProgress((s) => s.clearSide);
  const [event, setEvent] = useState<MarkEvent | null>(null);

  const mark = (side: ProgressSide, position: number) => {
    const current = useProgress.getState().byRouteId[routeId];
    setSide(routeId, side, position);
    setEvent({
      side,
      position,
      previous: current?.[side]?.position ?? null,
      suggestion: mapping
        ? suggestPartnerMark({
            mapping,
            mark: { side, position },
            otherPosition: current?.[otherSideOf(side)]?.position ?? 0,
          })
        : null,
    });
  };

  // Stable, so the banner's auto-dismiss timer is not restarted every render.
  const dismiss = useCallback(() => setEvent(null), []);

  const undo = () => {
    if (!event) return;
    if (event.previous === null) {
      clearSide(routeId, event.side);
    } else {
      setSide(routeId, event.side, event.previous);
    }
    dismiss();
  };

  const acceptSuggestion = () => {
    if (!event?.suggestion) return;
    setSide(routeId, event.suggestion.side, event.suggestion.position);
    dismiss();
  };

  return { event, mark, undo, acceptSuggestion, dismiss };
}
