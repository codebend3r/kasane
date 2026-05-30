import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMedia } from '@/api/anilist';
import { getMangaDexInfoByAniListId } from '@/api/mangadex';
import {
  buildSyntheticMapping,
  findMappingByMediaId,
} from '@/data';
import { EpisodeChapterRail } from '@/components/EpisodeChapterRail';
import { SeasonCoverage } from '@/components/SeasonCoverage';
import { VolumesGrid } from '@/components/VolumesGrid';
import { MOBILE_WIDTH_BREAKPOINT } from '@/components/CoverCarousel';
import { Footer } from '@/components/Footer';
import {
  formatAniListDate,
  formatAniListDateJa,
  localeLabel,
} from '@/data/format';
import { usePreferences } from '@/state/preferences';
import type { SeriesBadge } from '@/types';
import { FONT } from '@/theme';

const BADGE_LABEL: Record<SeriesBadge, string> = {
  both: 'ANIME + MANGA',
  'manga-only': 'MANGA ONLY',
  'anime-only': 'ANIME ONLY',
};

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const japanese = usePreferences((s) => s.japanese);
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_WIDTH_BREAKPOINT;
  const mobileCoverWidth = Math.min(windowWidth - 32, 420);
  const mobileCoverHeight = Math.round(mobileCoverWidth * (340 / 240));

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMedia(mediaId),
    enabled: !Number.isNaN(mediaId),
  });

  const curatedMapping = useMemo(() => findMappingByMediaId(mediaId), [mediaId]);

  const partnerId = useMemo(() => {
    if (!media) return null;
    if (curatedMapping) {
      return media.id === curatedMapping.anilistAnimeId
        ? curatedMapping.anilistMangaId
        : curatedMapping.anilistAnimeId;
    }
    const targetType = media.type === 'MANGA' ? 'ANIME' : 'MANGA';
    const targetRelation = media.type === 'MANGA' ? 'ADAPTATION' : 'SOURCE';
    const edge = media.relations?.edges.find(
      (e) => e.relationType === targetRelation && e.node.type === targetType
    );
    return edge?.node.id ?? null;
  }, [media, curatedMapping]);

  const { data: partner } = useQuery({
    queryKey: ['media', partnerId],
    queryFn: () => getMedia(partnerId!),
    enabled: !!partnerId,
  });

  const manga =
    media?.type === 'MANGA'
      ? media
      : partner?.type === 'MANGA'
        ? partner
        : null;
  const anime =
    media?.type === 'ANIME'
      ? media
      : partner?.type === 'ANIME'
        ? partner
        : null;
  const primary = manga ?? anime ?? null;

  const mangaPreferredTitle =
    manga?.title.english ?? manga?.title.romaji ?? '';
  const { data: mangadex, isFetching: mangadexLoading } = useQuery({
    queryKey: ['mangadex', manga?.id, mangaPreferredTitle],
    queryFn: () => getMangaDexInfoByAniListId(manga!.id, mangaPreferredTitle),
    enabled: !!manga && !!mangaPreferredTitle,
    staleTime: 60 * 60 * 1000,
  });

  const syntheticMapping = useMemo(
    () => (media && !curatedMapping ? buildSyntheticMapping(media) : null),
    [media, curatedMapping]
  );
  const mapping = curatedMapping ?? syntheticMapping;
  const isAutoEstimated = !curatedMapping && !!syntheticMapping;
  const arcsBehind = mapping
    ? mapping.mappings.filter((m) => !m.episodes).length
    : 0;

  const routeId = manga?.id ?? anime?.id ?? mediaId;

  const badge: SeriesBadge = useMemo(() => {
    if (!media) return 'manga-only';
    if (media.type === 'MANGA') {
      const hasAdapter = media.relations?.edges.some(
        (e) => e.relationType === 'ADAPTATION' && e.node.type === 'ANIME'
      );
      return hasAdapter ? 'both' : 'manga-only';
    }
    const hasSource = media.relations?.edges.some(
      (e) => e.relationType === 'SOURCE' && e.node.type === 'MANGA'
    );
    return hasSource ? 'both' : 'anime-only';
  }, [media]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c5cff" />
      </View>
    );
  }

  if (!media || !primary) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Could not load series.</Text>
      </View>
    );
  }

  const totalVolumes = mangadex?.volumes ?? manga?.volumes ?? null;
  const totalChapters = mangadex?.chapters ?? manga?.chapters ?? null;
  const totalEpisodes = mapping
    ? (() => {
        const eps = mapping.mappings
          .map((m) => m.episodes?.[1])
          .filter((v): v is number => typeof v === 'number');
        return eps.length > 0 ? Math.max(...eps) : anime?.episodes ?? null;
      })()
    : anime?.episodes ?? null;
  const status = primary.status?.toLowerCase() ?? null;
  const showAnimeStats = badge !== 'manga-only';
  const showMangaStats = badge !== 'anime-only';

  const subParts: string[] = [];
  if (showMangaStats) {
    subParts.push(`${totalChapters ?? '?'} ch`);
    subParts.push(`${totalVolumes ?? '?'} vol`);
  }
  if (showAnimeStats) {
    subParts.push(`${totalEpisodes ?? '?'} eps`);
  }
  if (primary.format) subParts.push(primary.format);
  if (primary.startDate.year) {
    subParts.push(formatAniListDate(primary.startDate));
  } else if (status) {
    subParts.push(status);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Image
          source={{ uri: primary.coverImage.large }}
          style={[
            styles.cover,
            isMobile && { width: mobileCoverWidth, height: mobileCoverHeight },
            badge === 'anime-only' && styles.coverAnimeOnly,
          ]}
        />
        <View style={[styles.headerMeta, isMobile && styles.headerMetaMobile]}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{BADGE_LABEL[badge]}</Text>
            </View>
            {curatedMapping && (
              <View style={[styles.badge, styles.mappedBadge]}>
                <Text style={styles.badgeText}>MAPPED</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>
            {japanese
              ? primary.title.native ??
                primary.title.english ??
                primary.title.romaji
              : primary.title.english ?? primary.title.romaji}
          </Text>
          {primary.title.native && !japanese ? (
            <Text style={styles.titleNative}>{primary.title.native}</Text>
          ) : null}
          <Text style={styles.sub}>{subParts.join('  ·  ')}</Text>
          {primary.startDate.year ? (
            <Text style={styles.dates}>
              Started {formatAniListDate(primary.startDate)}
              {primary.countryOfOrigin === 'JP'
                ? `  ·  ${formatAniListDateJa(primary.startDate)}`
                : ''}
            </Text>
          ) : null}
          {primary.endDate?.year ? (
            <Text style={styles.dates}>
              Ended {formatAniListDate(primary.endDate)}
            </Text>
          ) : null}
          {primary.genres.length > 0 ? (
            <View style={styles.tagRow}>
              {primary.genres.map((g) => (
                <View key={g} style={styles.tag}>
                  <Text style={styles.tagText}>{g}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {primary.description && (
            <Text style={styles.description} numberOfLines={8}>
              {primary.description.replace(/<[^>]+>/g, '')}
            </Text>
          )}
        </View>
      </View>

      {mapping ? (
        <View style={styles.mappingBlock}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Episode ↔ Chapter map</Text>
            {arcsBehind > 0 && (
              <View style={styles.arcsBehindBadge}>
                <Text style={styles.arcsBehindText}>
                  {arcsBehind} {arcsBehind === 1 ? 'ARC' : 'ARCS'} BEHIND
                </Text>
              </View>
            )}
          </View>
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
            seriesId={String(routeId)}
            totalChapters={totalChapters}
          />
          {curatedMapping ? <SeasonCoverage mapping={curatedMapping} /> : null}
        </View>
      ) : badge === 'anime-only' ? null : (
        <View style={styles.noMapping}>
          <Text style={styles.noMappingTitle}>No mapping available yet</Text>
          <Text style={styles.noMappingBody}>
            We couldn&apos;t find an anime↔manga adaptation pair on AniList for
            this entry, and no curated mapping exists. Add a JSON file to{' '}
            <Text style={styles.code}>src/data/mappings/</Text> in the repo.
          </Text>
        </View>
      )}

      {manga && (
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
      )}

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

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', gap: 16 },
  headerMobile: { flexDirection: 'column', alignItems: 'center' },
  cover: { width: 240, height: 340, backgroundColor: '#222' },
  coverAnimeOnly: { borderWidth: 2, borderColor: 'rgb(124, 92, 255)' },
  headerMeta: { flex: 1, gap: 6, minWidth: 240 },
  headerMetaMobile: { flex: 0, minWidth: 0, alignSelf: 'stretch' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 2 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#7c5cff',
  },
  mappedBadge: { backgroundColor: '#5cdfff' },
  badgeText: {
    color: '#0c0c0e',
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  arcsBehindBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderLeftWidth: 4,
    borderLeftColor: '#ffd65c',
  },
  arcsBehindText: {
    color: '#ffd65c',
    fontSize: 14,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
  empty: { color: '#9aa0a6', fontFamily: FONT.regular, paddingTop: 8 },
  spinnerWrap: { paddingTop: 12 },
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
  noMappingBody: {
    color: '#cfd2d6',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT.regular,
  },
  code: { fontFamily: 'Menlo', color: '#7c5cff' },
  volumesBlock: { gap: 12 },
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
});
