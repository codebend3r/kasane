# Mobile cover carousel

## Goal

On narrow viewports, replace the two cover-grid layouts with a snap-to-cover
horizontal carousel. On wider viewports the existing wrap-grid is unchanged.

The two affected surfaces:

- Home page — `LatestReleases` in `app/index.tsx`
- Manga detail page — `VolumesGrid` in `src/components/VolumesGrid.tsx`

## Behavior

- Mobile detection: container width `< 700px`, measured per-grid via
  `onLayout` (same pattern as `LatestReleases` today).
- Snap: one cover centered at a time, swipe lands on the next/previous cover.
- Peek: previous/next covers visible on either side of the active cover.
- Indicator: a row of dots beneath the carousel, active dot highlighted in
  `#7c5cff`. When `items.length > 12`, collapse to a `n / total` counter to
  avoid a noisy row (relevant for long manga with 24+ volumes).
- Volume locale variants: tapping a card with variants still expands the
  variant row inside the active slide (no behavior change vs. desktop).

## Architecture

```
src/components/
  CoverCarousel.tsx        ← new
  VolumesGrid.tsx          ← gains onLayout + carousel branch
app/
  index.tsx                ← LatestReleases gains onLayout + carousel branch
```

Single breakpoint constant `MOBILE_WIDTH_BREAKPOINT = 700` exported from
`CoverCarousel.tsx`. No global "isMobile" hook — each grid measures itself.

## `CoverCarousel` contract

```ts
type CoverCarouselProps<T> = {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  gap?: number; // default 12
  containerWidth: number; // measured by caller
};
```

Internals:

- Horizontal `FlatList` so off-screen cards are virtualized (matters at 24+
  volumes).
- `snapToInterval = itemWidth + gap`, `decelerationRate = "fast"`,
  `disableIntervalMomentum`, `snapToAlignment = "start"`.
- Side padding `= (containerWidth - itemWidth) / 2` on both ends to center
  the active card and reveal neighbor peek.
- `onMomentumScrollEnd` derives the active index from
  `contentOffset.x / (itemWidth + gap)` and stores it for the indicator.
- Indicator: `Dots` when `items.length <= 12`, otherwise `Counter`.
- Card height passed in by caller; carousel height = `itemHeight`.

## Mobile cover sizes

- `LatestReleases` slides: 160×280 (same as desktop card; aspect already fits
  small viewports).
- `VolumesGrid` slides: 140×220 — slightly larger than the desktop 120×180
  since one cover gets the spotlight.

## Out of scope

- Auto-play / timed advance.
- Arrow buttons on web.
- Persisting the active index across navigation.
- Variant interactions beyond what `VolumeCard` already does.

## Files touched

- `src/components/CoverCarousel.tsx` — new file.
- `src/components/VolumesGrid.tsx` — wrap in `onLayout`-driven switch.
- `app/index.tsx` — wrap the `LatestReleases` grid in the same switch.
