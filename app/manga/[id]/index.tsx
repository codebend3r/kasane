import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMedia } from '@/api/anilist';
import { getMangaDexInfoByAniListId } from '@/api/mangadex';
import {
  buildSyntheticMapping,
  chapterToEpisodes,
  episodeToChapters,
  findMappingByMediaId,
} from '@/data';
import { EpisodeChapterRail } from '@/components/EpisodeChapterRail';
import { formatAniListDate, formatAniListDateJa, localeLabel } from '@/data/format';
import type { MangaDexInfo, MangaDexVolumeCover, SeriesMapping } from '@/types';
import { FONT } from '@/theme';

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const preferredTitle =
    media?.title.english ?? media?.title.romaji ?? '';

  const { data: mangadex, isFetching: mangadexLoading } = useQuery({
    queryKey: ['mangadex', mediaId, preferredTitle],
    queryFn: () => getMangaDexInfoByAniListId(mediaId, preferredTitle),
    enabled: !!media && media.type === 'MANGA' && !!preferredTitle,
    staleTime: 60 * 60 * 1000,
  });

  const curatedMapping = useMemo(() => findMappingByMediaId(mediaId), [mediaId]);
  const syntheticMapping = useMemo(
    () => (media && !curatedMapping ? buildSyntheticMapping(media) : null),
    [media, curatedMapping]
  );
  const mapping = curatedMapping ?? syntheticMapping;
  const isAutoEstimated = !curatedMapping && !!syntheticMapping;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c5cff" />
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Could not load manga.</Text>
      </View>
    );
  }

  const totalVolumes = mangadex?.volumes ?? media.volumes ?? null;
  const totalChapters = mangadex?.chapters ?? media.chapters ?? null;
  const status = media.status?.toLowerCase() ?? null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image source={{ uri: media.coverImage.large }} style={styles.cover} />
        <View style={styles.headerMeta}>
          <Text style={styles.title}>
            {media.title.english ?? media.title.romaji}
          </Text>
          {media.title.native ? (
            <Text style={styles.titleNative}>{media.title.native}</Text>
          ) : null}
          <Text style={styles.sub}>
            MANGA · {totalChapters ?? '?'} ch · {totalVolumes ?? '?'} vol
            {media.format ? ` · ${media.format}` : ''}
            {status ? ` · ${status}` : ''}
          </Text>
          {media.startDate.year ? (
            <Text style={styles.dates}>
              Started {formatAniListDate(media.startDate)}
              {media.countryOfOrigin === 'JP'
                ? `  ·  ${formatAniListDateJa(media.startDate)}`
                : ''}
            </Text>
          ) : null}
          {media.endDate?.year ? (
            <Text style={styles.dates}>
              Ended {formatAniListDate(media.endDate)}
            </Text>
          ) : null}
          {media.genres.length > 0 ? (
            <View style={styles.tagRow}>
              {media.genres.map((g) => (
                <View key={g} style={styles.tag}>
                  <Text style={styles.tagText}>{g}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {media.description && (
            <Text style={styles.description} numberOfLines={8}>
              {media.description.replace(/<[^>]+>/g, '')}
            </Text>
          )}
        </View>
      </View>

      {mapping ? (
        <View style={styles.mappingBlock}>
          <Text style={styles.sectionTitle}>Anime episode coverage</Text>
          <Text style={styles.sectionLead}>
            This manga is adapted across the following anime arcs. Tap a band for
            episode-by-episode chapter alignment.
          </Text>
          {isAutoEstimated && (
            <View style={styles.autoBanner}>
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>AUTO-ESTIMATED</Text>
              </View>
              <Text style={styles.autoBannerBody}>
                Linear pacing — anime episode count distributed evenly across
                the manga chapter count. Real pacing varies; curated JSON in{' '}
                <Text style={styles.code}>src/data/mappings/</Text> overrides this.
              </Text>
            </View>
          )}
          <EpisodeChapterRail
            mapping={mapping}
            seriesId={String(mediaId)}
            totalChapters={totalChapters}
          />
          {curatedMapping ? (
            <View style={styles.seasonWrap}>
              <SeasonCoverage mapping={curatedMapping} />
            </View>
          ) : null}
          <QuickLookup mapping={mapping} />
        </View>
      ) : (
        <View style={styles.noMapping}>
          <Text style={styles.noMappingTitle}>No anime adaptation mapped yet</Text>
          <Text style={styles.noMappingBody}>
            No curated or auto-estimated mapping is available for this manga.
            Add a JSON file to <Text style={styles.code}>src/data/mappings/</Text>.
          </Text>
        </View>
      )}

      <View style={styles.volumesBlock}>
        <Text style={styles.sectionTitle}>Volumes</Text>
        {mangadexLoading && !mangadex ? (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator color="#7c5cff" />
          </View>
        ) : mangadex && mangadex.covers.length > 0 ? (
          <VolumesGrid covers={mangadex.covers} />
        ) : (
          <Text style={styles.empty}>
            No volume art on MangaDex for this title.
          </Text>
        )}
      </View>

      {mangadex && mangadex.titles.length > 1 ? (
        <View style={styles.titlesBlock}>
          <Text style={styles.sectionTitle}>Titles & translations</Text>
          <View style={styles.titlesList}>
            {mangadex.titles.map((t, idx) => (
              <View key={`${t.locale}-${idx}`} style={styles.titleRow}>
                <Text style={styles.titleLocale}>{localeLabel(t.locale)}</Text>
                <Text style={styles.titleValue}>{t.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.sourcesWrap}>
        <View style={styles.sources}>
          <Text style={styles.sourcesText}>
            Data: AniList (metadata) · MangaDex (volume covers, multilingual titles)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

type VolumeGroup = {
  volume: number;
  primary: MangaDexVolumeCover;
  variants: MangaDexVolumeCover[];
};

const LOCALE_RANK: Record<string, number> = { ja: 0, en: 1 };

function groupCovers(covers: MangaDexVolumeCover[]): VolumeGroup[] {
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
        const ra = LOCALE_RANK[a.locale] ?? 99;
        const rb = LOCALE_RANK[b.locale] ?? 99;
        if (ra !== rb) return ra - rb;
        return a.volume.localeCompare(b.volume);
      });
      return { volume, primary: sorted[0], variants: sorted.slice(1) };
    });
}

function VolumesGrid({ covers }: { covers: MangaDexVolumeCover[] }) {
  const groups = useMemo(() => groupCovers(covers), [covers]);
  return (
    <View style={styles.volumeGrid}>
      {groups.map((group) => (
        <VolumeCard key={`vol-${group.volume}`} group={group} />
      ))}
    </View>
  );
}

function coverKey(c: MangaDexVolumeCover): string {
  return `${c.volume}-${c.locale}`;
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
      duration: 180,
      useNativeDriver: true,
    }).start();

  return (
    <View style={[styles.volumeCard, isHovered && styles.volumeCardHovered]}>
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
          styles.volumeCoverWrap,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Animated.View style={[styles.volumeCoverInner, { transform: [{ scale }] }]}>
          <Image source={{ uri: primary.thumbUrl }} style={styles.volumeCover} />
          {hasVariants && (
            <View style={styles.variantBadge}>
              <Text style={styles.variantBadgeText}>+{variants.length}</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
      <Text style={styles.volumeNumber}>Vol. {group.volume}</Text>
      <Text style={styles.volumeLocale}>{localeLabel(primary.locale)}</Text>
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

function SeasonCoverage({ mapping }: { mapping: SeriesMapping }) {
  const seasonBuckets = useMemo(() => {
    const m = new Map<string, typeof mapping.mappings>();
    for (const entry of mapping.mappings) {
      if (!entry.episodes) continue;
      const key = entry.season ? `Season ${entry.season}` : 'Other';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(entry);
    }
    return Array.from(m.entries());
  }, [mapping]);

  if (seasonBuckets.length === 0) return null;
  if (seasonBuckets.length === 1 && seasonBuckets[0][0] === 'Other') return null;

  return (
    <View style={styles.seasonBlock}>
      <Text style={styles.seasonLabel}>Per-season chapter coverage</Text>
      {seasonBuckets.map(([label, entries]) => {
        const minCh = Math.min(...entries.map((e) => e.chapters[0]));
        const maxCh = Math.max(...entries.map((e) => e.chapters[1]));
        const minEp = Math.min(...entries.map((e) => e.episodes![0]));
        const maxEp = Math.max(...entries.map((e) => e.episodes![1]));
        return (
          <View key={label} style={styles.seasonRow}>
            <Text style={styles.seasonName}>{label}</Text>
            <Text style={styles.seasonMeta}>
              Eps {minEp}–{maxEp} · Ch {minCh}–{maxCh}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function QuickLookup({ mapping }: { mapping: SeriesMapping }) {
  const [chInput, setChInput] = useState('');
  const [epInput, setEpInput] = useState('');

  const chNum = Number(chInput);
  const epNum = Number(epInput);
  const fromCh = !Number.isNaN(chNum) && chNum > 0 ? chapterToEpisodes(mapping, chNum) : null;
  const fromEp = !Number.isNaN(epNum) && epNum > 0 ? episodeToChapters(mapping, epNum) : null;
  const seasonForCh = useMemo(() => {
    if (!chNum) return null;
    const hit = mapping.mappings.find(
      (m) => chNum >= m.chapters[0] && chNum <= m.chapters[1]
    );
    return hit?.season ?? null;
  }, [chNum, mapping]);

  return (
    <View style={styles.lookup}>
      <Text style={styles.sectionTitle}>Quick lookup</Text>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished chapter</Text>
        <TextInput
          value={chInput}
          onChangeText={setChInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 38"
          placeholderTextColor="#6b7177"
        />
        <Text style={styles.lookupResult}>
          → {fromCh ? `episodes ${fromCh[0]}–${fromCh[1]}` : '—'}
          {seasonForCh ? ` (S${seasonForCh})` : ''}
        </Text>
      </View>
      <View style={styles.lookupRow}>
        <Text style={styles.lookupLabel}>I finished episode</Text>
        <TextInput
          value={epInput}
          onChangeText={setEpInput}
          keyboardType="number-pad"
          style={styles.lookupInput}
          placeholder="e.g. 12"
          placeholderTextColor="#6b7177"
        />
        <Text style={styles.lookupResult}>
          → {fromEp ? `chapters ${fromEp[0]}–${fromEp[1]}` : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', gap: 16 },
  cover: { width: 140, height: 200, backgroundColor: '#222' },
  headerMeta: { flex: 1, gap: 6, minWidth: 240 },
  title: {
    color: '#f5f5f5',
    fontSize: 32,
    letterSpacing: -1,
    fontFamily: FONT.bold,
    lineHeight: 36,
  },
  titleNative: {
    color: '#cfd2d6',
    fontSize: 18,
    fontFamily: FONT.medium,
    marginTop: -2,
  },
  sub: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
    paddingTop: 2,
  },
  dates: {
    color: '#cfd2d6',
    fontSize: 13,
    fontFamily: FONT.medium,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 4 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#17181b',
    borderLeftWidth: 2,
    borderLeftColor: '#7c5cff',
  },
  tagText: {
    color: '#cfd2d6',
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: FONT.semibold,
    textTransform: 'uppercase',
  },
  description: {
    color: '#cfd2d6',
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 8,
    fontFamily: FONT.regular,
  },
  sectionTitle: {
    color: '#f5f5f5',
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  sectionLead: {
    color: '#9aa0a6',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT.regular,
    marginTop: -4,
  },
  empty: { color: '#9aa0a6', fontFamily: FONT.regular, paddingTop: 8 },
  spinnerWrap: { paddingTop: 12 },
  seasonWrap: { paddingTop: 4 },
  mappingBlock: { gap: 10 },
  autoBanner: {
    padding: 14,
    backgroundColor: '#1f1a2e',
    borderLeftWidth: 4,
    borderLeftColor: '#ffd65c',
    gap: 8,
  },
  autoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ffd65c',
  },
  autoBadgeText: {
    color: '#0c0c0e',
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONT.bold,
  },
  autoBannerBody: {
    color: '#cfd2d6',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
  noMapping: {
    padding: 16,
    backgroundColor: '#17181b',
    gap: 6,
  },
  noMappingTitle: { color: '#ffd65c', fontFamily: FONT.bold },
  noMappingBody: { color: '#cfd2d6', fontSize: 13, lineHeight: 18, fontFamily: FONT.regular },
  code: { fontFamily: 'Menlo', color: '#7c5cff' },
  seasonBlock: {
    padding: 12,
    backgroundColor: '#17181b',
    gap: 6,
  },
  seasonLabel: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
    paddingBottom: 4,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  seasonName: {
    color: '#f5f5f5',
    fontSize: 14,
    fontFamily: FONT.semibold,
  },
  seasonMeta: {
    color: '#cfd2d6',
    fontSize: 12,
    fontFamily: FONT.regular,
  },
  volumesBlock: { gap: 12 },
  volumeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  volumeCard: {
    width: 120,
    gap: 4,
    position: 'relative',
    zIndex: 1,
  },
  volumeCardHovered: {
    zIndex: 10,
  },
  volumeCoverWrap: {
    width: 120,
    height: 180,
    position: 'relative',
  },
  volumeCoverInner: {
    width: 120,
    height: 180,
    position: 'relative',
  },
  volumeCover: {
    width: 120,
    height: 180,
    backgroundColor: '#222',
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
  volumeNumber: {
    color: '#f5f5f5',
    fontSize: 13,
    fontFamily: FONT.bold,
  },
  volumeLocale: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: FONT.semibold,
  },
  titlesBlock: { gap: 8 },
  titlesList: { gap: 6 },
  titleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'baseline',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  titleLocale: {
    color: '#7c5cff',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
    minWidth: 130,
  },
  titleValue: {
    color: '#f5f5f5',
    fontSize: 14,
    flex: 1,
    fontFamily: FONT.regular,
  },
  sourcesWrap: { paddingTop: 8 },
  sources: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
  },
  sourcesText: {
    color: '#6b7177',
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: FONT.regular,
  },
  lookup: { gap: 12, paddingTop: 8 },
  lookupRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  lookupLabel: { color: '#cfd2d6', fontSize: 13, fontFamily: FONT.medium },
  lookupInput: {
    backgroundColor: '#17181b',
    color: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 80,
    fontFamily: FONT.regular,
  },
  lookupResult: { color: '#7c5cff', fontSize: 13, fontFamily: FONT.bold },
});
