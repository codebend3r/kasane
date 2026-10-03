import { isAdapted, lastMappedChapter } from "@/data/mapping";
import type { SeriesMapping } from "@/types";

// The geometry the episode ↔ chapter rail and the coverage pie both draw. Each
// axis lays its segments end to end by span, so a filler gap in the catalog
// takes no room on screen — and every position-to-screen conversion goes
// through `fractionAt`, which walks the same segments, so a progress marker
// always lands on the bar it belongs to.

export type ArcSegment = {
  /** Position in `mapping.mappings`; null for the unmapped tail. */
  arcIndex: number | null;
  /** The arc's catalog name, when it has one. */
  name: string | null;
  from: number;
  to: number;
  /** Units the segment covers: `to - from + 1`. */
  span: number;
  /** Units drawn before this segment on its axis. */
  offset: number;
  adapted: boolean;
};

export type ArcAxis = {
  segments: ArcSegment[];
  /** Sum of every segment's span: the length the view draws. */
  total: number;
};

export type ArcLayout = {
  /** Adapted arcs along the episode axis. */
  anime: ArcAxis;
  /** Every arc along the chapter axis, then any published tail. */
  manga: ArcAxis;
  /** Share of mapped chapters the anime has reached, rounded to a percent. */
  percentAdapted: number;
};

type Draft = Omit<ArcSegment, "span" | "offset">;

const toAxis = (drafts: readonly Draft[]): ArcAxis =>
  drafts.reduce<ArcAxis>(
    (axis, draft) => {
      const span = draft.to - draft.from + 1;
      return {
        segments: [...axis.segments, { ...draft, span, offset: axis.total }],
        total: axis.total + span,
      };
    },
    { segments: [], total: 0 },
  );

const spanOf = (segments: readonly ArcSegment[]): number =>
  segments.reduce((sum, s) => sum + s.span, 0);

export function buildArcLayout({
  mapping,
  totalChapters,
}: {
  mapping: SeriesMapping;
  totalChapters: number | null;
}): ArcLayout {
  const arcs = mapping.mappings;
  const lastChapter = lastMappedChapter(mapping);

  const anime = toAxis(
    arcs.flatMap((arc, arcIndex): Draft[] =>
      isAdapted(arc)
        ? [
            {
              arcIndex,
              name: arc.arc ?? null,
              from: arc.episodes[0],
              to: arc.episodes[1],
              adapted: true,
            },
          ]
        : [],
    ),
  );

  // Published chapters past the last arc get a grey tail, but only when every
  // arc is adapted: an unadapted arc already says the manga is ahead.
  const tail: Draft[] =
    totalChapters !== null &&
    totalChapters > lastChapter &&
    arcs.every(isAdapted)
      ? [
          {
            arcIndex: null,
            name: null,
            from: lastChapter + 1,
            to: totalChapters,
            adapted: false,
          },
        ]
      : [];

  const manga = toAxis([
    ...arcs.map((arc, arcIndex): Draft => ({
      arcIndex,
      name: arc.arc ?? null,
      from: arc.chapters[0],
      to: arc.chapters[1],
      adapted: isAdapted(arc),
    })),
    ...tail,
  ]);

  const mapped = manga.segments.filter((s) => s.arcIndex !== null);
  const mappedSpan = spanOf(mapped);
  return {
    anime,
    manga,
    percentAdapted:
      mappedSpan > 0
        ? Math.round(
            (spanOf(mapped.filter((s) => s.adapted)) / mappedSpan) * 100,
          )
        : 0,
  };
}

/**
 * Where `position` falls along `axis`, from 0 to 1. A position inside a gap
 * between segments sits at the end of the segment before it.
 */
export function fractionAt(axis: ArcAxis, position: number): number {
  if (axis.total === 0) return 0;
  const covered = axis.segments.reduce(
    (sum, s) => sum + Math.min(Math.max(position - s.from + 1, 0), s.span),
    0,
  );
  return covered / axis.total;
}

/** The segment drawn at `fraction` (0 to 1) along `axis`, if any. */
export function segmentAt(axis: ArcAxis, fraction: number): ArcSegment | null {
  const unit = fraction * axis.total;
  return (
    axis.segments.find((s) => unit >= s.offset && unit < s.offset + s.span) ??
    null
  );
}

/** What a segment shows on its own bar or slice. */
export const segmentLabel = (s: ArcSegment): string =>
  s.name ?? `${s.from}–${s.to}`;

const spokenName = (s: ArcSegment): string => s.name ?? `${s.from} to ${s.to}`;

// The rail and the pie are pure colour and geometry, so a screen reader gets
// the same facts in words.

export function describeEpisodes(layout: ArcLayout): string {
  const parts = layout.anime.segments.map(
    (s) => `${spokenName(s)}, episodes ${s.from} to ${s.to}`,
  );
  return `Anime episodes by arc. ${parts.join(". ")}`;
}

export function describeChapters(layout: ArcLayout): string {
  const parts = layout.manga.segments
    .filter((s) => s.arcIndex !== null)
    .map(
      (s) =>
        `${spokenName(s)}, chapters ${s.from} to ${s.to}${s.adapted ? "" : ", not yet adapted"}`,
    );
  return `Manga chapters by arc. ${parts.join(". ")}`;
}

export function describeCoverage(layout: ArcLayout): string {
  const parts = layout.manga.segments.map(
    (s) => `${segmentLabel(s)}, up to chapter ${s.to}`,
  );
  return `Arc coverage. ${layout.percentAdapted}% of the mapped chapters are adapted. ${parts.join(". ")}`;
}
