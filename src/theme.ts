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
  /** Barely-lifted panel: the side menu drawer. */
  surfaceSubtle: "#0f1013",
  /** Tinted background for a `danger`-accented callout. */
  surfaceCallout: "#1b1524",
  /** Hairline dividers and input borders. */
  border: "#2a2c30",
  /** Edge of a panel that floats over the page, like the side menu. */
  borderSubtle: "#22242a",
  /** Outline of an unselected control, such as an unchecked checkbox. */
  borderControl: "#3a3d42",
  /** Neutral box behind a cover image while it loads. */
  coverPlaceholder: "#222222",
  /** Poster box in a grid tile before its art resolves. */
  tilePlaceholder: "#1f2024",
  /** Unfilled remainder of a progress bar. */
  progressTrack: "#1a1a1a",

  /** Headings and primary body copy. */
  textPrimary: "#f5f5f5",
  /** Supporting copy under a heading. */
  textSecondary: "#cfd2d6",
  /** Labels, metadata, uppercase eyebrow text. */
  textMuted: "#9aa0a6",
  /** Input placeholders and the lowest-emphasis text. */
  textFaint: "#6b7177",
  /** Text sitting on a bright fill: arc segments, badges, popovers. */
  textOnBright: "#000000",
  /** Text sitting on the violet accent, such as the variant badge. */
  textOnAccent: "#ffffff",

  /** Brand violet: wordmark rule, links, active state, focus. */
  accent: "#7c5cff",
  /** Accent laid over cover art, where the art must still read through. */
  accentTranslucent: "rgba(124, 92, 255, 0.92)",
  /** Advisory state: "arcs behind", "auto-estimated", "no mapping". */
  notice: "#ffd65c",
  /** Error text. Shares its value with `ARC_COLORS[1]`, which is unrelated. */
  danger: "#ff7c5c",
  /** Confirmed state: the MAPPED badge, "caught up", a resolved lookup. */
  success: "#5cff9d",

  /** Identifies the anime side: its badge, progress band, and rail. */
  sideAnime: "#5cdfff",
  /** Informational highlight: the MAPPED badge, an active view toggle. */
  highlight: "#5cdfff",
  /** Identifies the manga side: its badge, progress band, and rail. */
  sideManga: "#ff7c5c",

  /** Black strip behind a volume's label block. */
  coverBackdrop: "#000000",
  /** Hairline outline around a volume cover. */
  coverBorder: "#ffffff",
  /** Dimmer behind the side menu drawer. */
  scrim: "#000000cc",
  /** Dimmer behind a bottom sheet. */
  scrimSheet: "rgba(0,0,0,0.55)",
  /** Dims the not-yet-consumed part of the rail and the pie. */
  overlayUnconsumed: "rgba(12,12,14,0.55)",
} as const;

/**
 * Categorical palette for arc segments, indexed by arc position and wrapped with
 * `%`. Shared by `EpisodeChapterRail` and `EpisodeChapterPie` so the same arc is
 * the same colour in both; do not reorder, and do not fork a second copy.
 */
export const ARC_COLORS = [
  "#7c5cff",
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
