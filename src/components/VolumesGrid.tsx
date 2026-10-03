import { useMemo, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MangaDexVolumeCover } from "@/types";
import { localeLabel } from "@/data/format";
import { groupCovers, type VolumeGroup } from "@/data/volumes";
import { usePreferences } from "@/state/preferences";
import { CoverCarousel } from "@/components/CoverCarousel";
import { useLayoutWidth } from "@/components/useLayoutWidth";
import { COLOR, FONT, NARROW_WIDTH, pressFeedback, SPACE } from "@/theme";

const MOBILE_COVER_WIDTH = 140;
const MOBILE_COVER_HEIGHT = 210;
const MOBILE_LABELS_HEIGHT = 38;
const MOBILE_VARIANT_ROW_HEIGHT = 70;
const MOBILE_CARD_HEIGHT =
  MOBILE_COVER_HEIGHT + MOBILE_LABELS_HEIGHT + MOBILE_VARIANT_ROW_HEIGHT;

function coverKey(c: MangaDexVolumeCover): string {
  return `${c.volume}-${c.locale}`;
}

export function VolumesGrid({ covers }: { covers: MangaDexVolumeCover[] }) {
  const japanese = usePreferences((s) => s.japanese);
  const groups = useMemo(
    () => groupCovers({ covers, japanese }),
    [covers, japanese],
  );
  const [containerWidth, onLayout] = useLayoutWidth();

  const isMobile = containerWidth > 0 && containerWidth < NARROW_WIDTH;

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
        accessibilityRole={hasVariants ? "button" : "image"}
        accessibilityLabel={
          hasVariants
            ? `Volume ${group.volume} cover, ${variants.length} more editions`
            : `Volume ${group.volume} cover`
        }
        accessibilityState={hasVariants ? { expanded: isOpen } : undefined}
        onHoverIn={() => {
          setIsHovered(true);
          animateTo(1.6);
        }}
        onHoverOut={() => {
          setIsHovered(false);
          animateTo(1);
        }}
        style={(state) => [
          { width },
          pressFeedback({ pressed: state.pressed }),
        ]}
      >
        <Animated.View
          style={[{ width, gap: SPACE.xs }, { transform: [{ scale }] }]}
        >
          <View style={{ width, height: coverHeight, position: "relative" }}>
            <Image
              source={{ uri: primary.thumbUrl }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
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
              accessibilityRole="button"
              accessibilityLabel={`Show the ${localeLabel(v.locale)} cover for volume ${v.volume}`}
              style={(state) => [styles.variantCell, pressFeedback(state)]}
            >
              <Image
                source={{ uri: v.thumbUrl }}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.variantThumb}
              />
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
    gap: SPACE.lg,
  },
  card: {
    gap: SPACE.xs,
    position: "relative",
    zIndex: 1,
  },
  cardHovered: {
    zIndex: 10,
  },
  cover: {
    backgroundColor: COLOR.coverPlaceholder,
    borderWidth: 1,
    borderColor: COLOR.coverBorder,
  },
  variantBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xxs,
    backgroundColor: COLOR.accentTranslucent,
  },
  variantBadgeText: {
    color: COLOR.textOnAccent,
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: FONT.bold,
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
    paddingTop: SPACE.xs,
  },
  variantCell: {
    width: 36,
    gap: SPACE.xxs,
  },
  variantThumb: {
    width: 36,
    height: 54,
    backgroundColor: COLOR.coverPlaceholder,
  },
  variantLabel: {
    color: COLOR.textMuted,
    fontSize: 9,
    fontFamily: FONT.semibold,
    letterSpacing: 0.4,
  },
  labels: {
    backgroundColor: COLOR.coverBackdrop,
    padding: SPACE.sm,
    gap: SPACE.xxs,
  },
  number: {
    color: COLOR.textPrimary,
    fontSize: 13,
    fontFamily: FONT.bold,
  },
  locale: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semibold,
  },
});
