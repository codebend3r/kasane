import { useMemo, useState } from "react";
import {
  Animated,
  Image,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MangaDexVolumeCover, PressableState } from "@/types";
import { localeLabel } from "@/data/format";
import { usePreferences } from "@/state/preferences";
import {
  CoverCarousel,
  MOBILE_WIDTH_BREAKPOINT,
} from "@/components/CoverCarousel";
import { FONT } from "@/theme";

const MOBILE_COVER_WIDTH = 140;
const MOBILE_COVER_HEIGHT = 210;
const MOBILE_LABELS_HEIGHT = 38;
const MOBILE_VARIANT_ROW_HEIGHT = 70;
const MOBILE_CARD_HEIGHT =
  MOBILE_COVER_HEIGHT + MOBILE_LABELS_HEIGHT + MOBILE_VARIANT_ROW_HEIGHT;

type VolumeGroup = {
  volume: number;
  primary: MangaDexVolumeCover;
  variants: MangaDexVolumeCover[];
};

function groupCovers(
  covers: MangaDexVolumeCover[],
  japanese: boolean,
): VolumeGroup[] {
  const localeRank: Record<string, number> = japanese
    ? { ja: 0, en: 1 }
    : { en: 0, ja: 1 };
  const groups = covers.reduce<Map<number, MangaDexVolumeCover[]>>((acc, c) => {
    const n = Number(c.volume);
    if (!Number.isFinite(n)) return acc;
    const base = Math.floor(n);
    const list = acc.get(base);
    if (list) list.push(c);
    else acc.set(base, [c]);
    return acc;
  }, new Map());
  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([volume, list]) => {
      const sorted = [...list].sort((a, b) => {
        const aIsInt = !a.volume.includes(".");
        const bIsInt = !b.volume.includes(".");
        if (aIsInt !== bIsInt) return aIsInt ? -1 : 1;
        const ra = localeRank[a.locale] ?? 99;
        const rb = localeRank[b.locale] ?? 99;
        if (ra !== rb) return ra - rb;
        return a.volume.localeCompare(b.volume);
      });
      return { volume, primary: sorted[0], variants: sorted.slice(1) };
    });
}

function coverKey(c: MangaDexVolumeCover): string {
  return `${c.volume}-${c.locale}`;
}

export function VolumesGrid({ covers }: { covers: MangaDexVolumeCover[] }) {
  const japanese = usePreferences((s) => s.japanese);
  const groups = useMemo(
    () => groupCovers(covers, japanese),
    [covers, japanese],
  );
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const isMobile =
    containerWidth > 0 && containerWidth < MOBILE_WIDTH_BREAKPOINT;

  if (containerWidth === 0) {
    return <View style={styles.measure} onLayout={onLayout} />;
  }

  if (isMobile) {
    return (
      <View onLayout={onLayout}>
        <CoverCarousel
          items={groups}
          keyExtractor={(g) => `vol-${g.volume}-${japanese ? "ja" : "en"}`}
          itemWidth={MOBILE_COVER_WIDTH}
          itemHeight={MOBILE_CARD_HEIGHT}
          containerWidth={containerWidth}
          renderItem={(g) => (
            <VolumeCard
              group={g}
              width={MOBILE_COVER_WIDTH}
              coverHeight={MOBILE_COVER_HEIGHT}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {groups.map((group) => (
        <VolumeCard
          key={`vol-${group.volume}-${japanese ? "ja" : "en"}`}
          group={group}
        />
      ))}
    </View>
  );
}

function VolumeCard({
  group,
  width = 120,
  coverHeight = 180,
}: {
  group: VolumeGroup;
  width?: number;
  coverHeight?: number;
}) {
  const allCovers = useMemo(() => [group.primary, ...group.variants], [group]);
  const [selectedKey, setSelectedKey] = useState<string>(
    coverKey(group.primary),
  );
  const [isOpen, setIsOpen] = useState(false);

  const primary =
    allCovers.find((c) => coverKey(c) === selectedKey) ?? group.primary;
  const variants = allCovers.filter((c) => c !== primary);
  const hasVariants = variants.length > 0;

  const [scale] = useState(() => new Animated.Value(1));
  const [isHovered, setIsHovered] = useState(false);
  const animateTo = (toValue: number) =>
    Animated.timing(scale, {
      toValue,
      duration: 120,
      useNativeDriver: true,
    }).start();

  return (
    <View style={[styles.card, { width }, isHovered && styles.cardHovered]}>
      <Pressable
        onPress={() => hasVariants && setIsOpen((v) => !v)}
        onHoverIn={() => {
          setIsHovered(true);
          animateTo(1.6);
        }}
        onHoverOut={() => {
          setIsHovered(false);
          animateTo(1);
        }}
        style={({ pressed }: PressableState) => [
          { width, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Animated.View style={[{ width, gap: 4 }, { transform: [{ scale }] }]}>
          <View style={{ width, height: coverHeight, position: "relative" }}>
            <Image
              source={{ uri: primary.thumbUrl }}
              style={[styles.cover, { width, height: coverHeight }]}
            />
            {hasVariants && (
              <View style={styles.variantBadge}>
                <Text style={styles.variantBadgeText}>+{variants.length}</Text>
              </View>
            )}
          </View>
          <View style={[styles.labels, { width }]}>
            <Text style={styles.number}>Vol. {group.volume}</Text>
            <Text style={styles.locale}>{localeLabel(primary.locale)}</Text>
          </View>
        </Animated.View>
      </Pressable>
      {isOpen && (
        <View style={[styles.variantRow, { width }]}>
          {variants.map((v) => (
            <Pressable
              key={coverKey(v)}
              onPress={() => setSelectedKey(coverKey(v))}
              style={({ hovered, pressed }: PressableState) => [
                styles.variantCell,
                { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
              ]}
            >
              <Image source={{ uri: v.thumbUrl }} style={styles.variantThumb} />
              <Text style={styles.variantLabel}>
                {v.volume}
                {v.locale && v.locale !== primary.locale
                  ? ` · ${v.locale.toUpperCase()}`
                  : ""}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  measure: { height: 1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    gap: 4,
    position: "relative",
    zIndex: 1,
  },
  cardHovered: {
    zIndex: 10,
  },
  cover: {
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#fff",
  },
  variantBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(124, 92, 255, 0.92)",
  },
  variantBadgeText: {
    color: "#fff",
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: FONT.bold,
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 4,
  },
  variantCell: {
    width: 36,
    gap: 2,
  },
  variantThumb: {
    width: 36,
    height: 54,
    backgroundColor: "#222",
  },
  variantLabel: {
    color: "#9aa0a6",
    fontSize: 9,
    fontFamily: FONT.semibold,
    letterSpacing: 0.4,
  },
  labels: {
    backgroundColor: "#000",
    padding: 6,
    gap: 2,
  },
  number: {
    color: "#f5f5f5",
    fontSize: 13,
    fontFamily: FONT.bold,
  },
  locale: {
    color: "#9aa0a6",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
});
