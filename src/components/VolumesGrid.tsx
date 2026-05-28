import { useMemo, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MangaDexVolumeCover } from '@/types';
import { localeLabel } from '@/data/format';
import { usePreferences } from '@/state/preferences';
import { FONT } from '@/theme';

type VolumeGroup = {
  volume: number;
  primary: MangaDexVolumeCover;
  variants: MangaDexVolumeCover[];
};

function groupCovers(
  covers: MangaDexVolumeCover[],
  japanese: boolean
): VolumeGroup[] {
  const localeRank: Record<string, number> = japanese
    ? { ja: 0, en: 1 }
    : { en: 0, ja: 1 };
  const groups = new Map<number, MangaDexVolumeCover[]>();
  for (const c of covers) {
    const n = Number(c.volume);
    if (!Number.isFinite(n)) continue;
    const base = Math.floor(n);
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base)!.push(c);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([volume, list]) => {
      const sorted = [...list].sort((a, b) => {
        const aIsInt = !a.volume.includes('.');
        const bIsInt = !b.volume.includes('.');
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
    [covers, japanese]
  );
  return (
    <View style={styles.grid}>
      {groups.map((group) => (
        <VolumeCard
          key={`vol-${group.volume}-${japanese ? 'ja' : 'en'}`}
          group={group}
        />
      ))}
    </View>
  );
}

function VolumeCard({ group }: { group: VolumeGroup }) {
  const allCovers = useMemo(
    () => [group.primary, ...group.variants],
    [group]
  );
  const [selectedKey, setSelectedKey] = useState<string>(coverKey(group.primary));
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
    <View style={[styles.card, isHovered && styles.cardHovered]}>
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
        style={({ pressed }: any) => [
          styles.cardPress,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Animated.View style={[styles.cardInner, { transform: [{ scale }] }]}>
          <View style={styles.coverWrap}>
            <Image source={{ uri: primary.thumbUrl }} style={styles.cover} />
            {hasVariants && (
              <View style={styles.variantBadge}>
                <Text style={styles.variantBadgeText}>+{variants.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.number}>Vol. {group.volume}</Text>
          <Text style={styles.locale}>{localeLabel(primary.locale)}</Text>
        </Animated.View>
      </Pressable>
      {isOpen && (
        <View style={styles.variantRow}>
          {variants.map((v) => (
            <Pressable
              key={coverKey(v)}
              onPress={() => setSelectedKey(coverKey(v))}
              style={({ hovered, pressed }: any) => [
                styles.variantCell,
                { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
              ]}
            >
              <Image source={{ uri: v.thumbUrl }} style={styles.variantThumb} />
              <Text style={styles.variantLabel}>
                {v.volume}
                {v.locale && v.locale !== primary.locale
                  ? ` · ${v.locale.toUpperCase()}`
                  : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: 120,
    gap: 4,
    position: 'relative',
    zIndex: 1,
  },
  cardHovered: {
    zIndex: 10,
  },
  cardPress: {
    width: 120,
  },
  cardInner: {
    width: 120,
    gap: 4,
  },
  coverWrap: {
    width: 120,
    height: 180,
    position: 'relative',
  },
  cover: {
    width: 120,
    height: 180,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#fff',
  },
  variantBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(124, 92, 255, 0.92)',
  },
  variantBadgeText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: FONT.bold,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
    width: 120,
  },
  variantCell: {
    width: 36,
    gap: 2,
  },
  variantThumb: {
    width: 36,
    height: 54,
    backgroundColor: '#222',
  },
  variantLabel: {
    color: '#9aa0a6',
    fontSize: 9,
    fontFamily: FONT.semibold,
    letterSpacing: 0.4,
  },
  number: {
    color: '#f5f5f5',
    fontSize: 13,
    fontFamily: FONT.bold,
    backgroundColor: '#000',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  locale: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
    backgroundColor: '#000',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
