export const FONT = {
  regular: "SpaceGrotesk_400Regular",
  medium: "SpaceGrotesk_500Medium",
  semibold: "SpaceGrotesk_600SemiBold",
  bold: "SpaceGrotesk_700Bold",
  display: "ZenTokyoZoo_400Regular",
} as const;

/**
 * Every colour the app ships, named by role. Extracted from the hex literals
 * that were previously inlined across `app/` and `src/components/`; the values
 * are unchanged, so adopting a token is always a pure refactor.
 *
 * New UI reads from here. Never introduce a fresh hex literal in a component.
 */
export const COLOR = {
  /** App background and the Stack `contentStyle`. */
  background: "#0c0c0e",
  /** Cards, pills, and the account chip. */
  surface: "#17181b",
  /** Raised blocks that need to separate from `surface`. */
  surfaceRaised: "#2a2a2a",
  /** Tinted background for notice banners (violet-shifted). */
  surfaceNotice: "#1f1a2e",
  /** Hairline dividers and input borders. */
  border: "#2a2c30",
  /** Neutral box behind a cover image while it loads. */
  coverPlaceholder: "#222222",

  /** Headings and primary body copy. */
  textPrimary: "#f5f5f5",
  /** Supporting copy under a heading. */
  textSecondary: "#cfd2d6",
  /** Labels, metadata, uppercase eyebrow text. */
  textMuted: "#9aa0a6",
  /** Input placeholders and the lowest-emphasis text. */
  textFaint: "#6b7177",

  /** Brand violet: wordmark rule, links, active state, focus. */
  accent: "#7c5cff",
  /** Advisory state: "arcs behind", "auto-estimated", "no mapping". */
  notice: "#ffd65c",
  /** Error text. Shares its value with `ARC_COLORS[0]`, which is unrelated. */
  danger: "#ff7c5c",
} as const;

/**
 * Categorical palette for arc segments, indexed by arc position and wrapped with
 * `%`. Shared by `EpisodeChapterRail` and `EpisodeChapterPie` so the same arc is
 * the same colour in both; do not reorder, and do not fork a second copy.
 */
export const ARC_COLORS = [
  "#ff7c5c",
  "#5cff9d",
  "#ffd65c",
  "#5cdfff",
  "#ff5c9d",
  "#9dff5c",
  "#ff9d5c",
] as const;

/** Films sit outside the arc sequence and always render in this colour. */
export const MOVIE_COLOR = "#5cdfff";

/**
 * Spacing scale for grid `gap` and container `padding`. The repo does not use
 * margins, so these two properties carry all layout spacing.
 */
export const SPACE = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
} as const;
