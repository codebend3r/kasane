import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { lastMappedEpisode } from "@/data/mapping";
import { partnerIdOf, seriesBadgeOf } from "@/data/pairing";
import { useResolvedMapping } from "@/queries/catalog";
import { useFranchise, useMangaDex, useMedia } from "@/queries/media";
import { FranchiseSeasons } from "@/components/FranchiseSeasons";
import { MappingSection } from "@/components/MappingSection";
import { SeriesHeader } from "@/components/SeriesHeader";
import { TitlesList } from "@/components/TitlesList";
import { VolumesGrid } from "@/components/VolumesGrid";
import { Footer } from "@/components/Footer";
import { formatAniListDate } from "@/data/format";
import { COLOR, FONT, NARROW_WIDTH } from "@/theme";

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < NARROW_WIDTH;
  const mobileCoverWidth = Math.min(windowWidth - 32, 420);
  const mobileCoverHeight = Math.round(mobileCoverWidth * (340 / 240));

  const { data: media, isLoading } = useMedia(
    Number.isNaN(mediaId) ? null : mediaId,
  );

  const resolved = useResolvedMapping(media ?? null);
  const curated = resolved?.source === "curated" ? resolved.mapping : null;

  // The curated mapping names the partner outright; otherwise trust AniList.
  const partnerId = !media
    ? null
    : curated
      ? media.id === curated.anilistAnimeId
        ? curated.anilistMangaId
        : curated.anilistAnimeId
      : partnerIdOf(media);

  const { data: partner } = useMedia(partnerId);

  const manga =
    media?.type === "MANGA"
      ? media
      : partner?.type === "MANGA"
        ? partner
        : null;
  const anime =
    media?.type === "ANIME"
      ? media
      : partner?.type === "ANIME"
        ? partner
        : null;
  const primary = manga ?? anime ?? null;

  const { data: mangadex, isFetching: mangadexLoading } = useMangaDex(manga);
  const { data: franchise } = useFranchise(anime);

  const routeId = manga?.id ?? anime?.id ?? mediaId;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLOR.accent} />
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

  const badge = seriesBadgeOf(media);
  const totalVolumes = mangadex?.volumes ?? manga?.volumes ?? null;
  const totalChapters = mangadex?.chapters ?? manga?.chapters ?? null;
  const totalEpisodes =
    (resolved ? lastMappedEpisode(resolved.mapping) : null) ??
    anime?.episodes ??
    null;
  const status = primary.status?.toLowerCase() ?? null;
  const showAnimeStats = badge !== "manga-only";
  const showMangaStats = badge !== "anime-only";

  const subParts: string[] = [];
  if (showMangaStats) {
    subParts.push(`${totalChapters ?? "?"} ch`);
    subParts.push(`${totalVolumes ?? "?"} vol`);
  }
  const movies = resolved?.mapping.movies ?? [];
  if (showAnimeStats) {
    subParts.push(`${totalEpisodes ?? "?"} eps`);
    if (movies.length > 0) {
      subParts.push(
        `${movies.length} ${movies.length === 1 ? "movie" : "movies"}`,
      );
    }
  }
  if (primary.format) subParts.push(primary.format);
  if (primary.startDate.year) {
    subParts.push(formatAniListDate(primary.startDate));
  } else if (status) {
    subParts.push(status);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SeriesHeader
        media={primary}
        badge={badge}
        subParts={subParts}
        isMapped={!!curated}
        isMobile={isMobile}
        mobileCoverWidth={mobileCoverWidth}
        mobileCoverHeight={mobileCoverHeight}
      />

      {!!anime && !!franchise && franchise.seasons.length > 1 && (
        <FranchiseSeasons franchise={franchise} currentId={anime.id} />
      )}

      <MappingSection
        resolved={resolved}
        routeId={routeId}
        totalChapters={totalChapters}
        badge={badge}
        isMobile={isMobile}
      />

      {manga && (
        <View style={styles.volumesBlock}>
          <Text style={styles.sectionTitle}>Volumes</Text>
          {mangadexLoading && !mangadex ? (
            <View style={styles.spinnerWrap}>
              <ActivityIndicator color={COLOR.accent} />
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

      {!!mangadex && <TitlesList titles={mangadex.titles} />}

      <View style={styles.sourcesWrap}>
        <View style={styles.sources}>
          <Text style={styles.sourcesText}>
            Data: AniList (metadata) · MangaDex (volume covers, multilingual
            titles)
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: {
    color: COLOR.textPrimary,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  empty: { color: COLOR.textMuted, fontFamily: FONT.regular, paddingTop: 8 },
  spinnerWrap: { paddingTop: 12 },
  volumesBlock: { gap: 12 },
  sourcesWrap: { paddingTop: 8 },
  sources: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.surfaceRaised,
  },
  sourcesText: {
    color: COLOR.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: FONT.regular,
  },
});
