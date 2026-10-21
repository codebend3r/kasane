import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { detailStats } from "@/data/seriesStats";
import { useFranchise, useMangaDex } from "@/queries/media";
import { useSeries } from "@/queries/series";
import { FranchiseSeasons } from "@/components/FranchiseSeasons";
import { MappingSection } from "@/components/MappingSection";
import { SeriesHeader } from "@/components/SeriesHeader";
import { TitlesList } from "@/components/TitlesList";
import { VolumesGrid } from "@/components/VolumesGrid";
import { Footer } from "@/components/Footer";
import { COLOR, FONT, SPACE, TEXT } from "@/theme";

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = Number(id);

  const { entry, resolved, isLoading } = useSeries(
    Number.isNaN(mediaId) ? null : mediaId,
  );
  const manga = entry?.manga ?? null;
  const anime = entry?.anime ?? null;

  const { data: mangadex, isFetching: mangadexLoading } = useMangaDex(manga);
  const { data: franchise } = useFranchise(anime);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLOR.accent} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Could not load series.</Text>
      </View>
    );
  }

  const { primary, badge, routeId } = entry;
  const totalChapters = mangadex?.chapters ?? manga?.chapters ?? null;
  const subParts = detailStats({
    entry,
    mapping: resolved?.mapping ?? null,
    chapters: totalChapters,
    volumes: mangadex?.volumes ?? manga?.volumes ?? null,
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SeriesHeader
        media={primary}
        badge={badge}
        subParts={subParts}
        isMapped={resolved?.source === "curated"}
      />

      {!!anime && !!franchise && franchise.seasons.length > 1 && (
        <FranchiseSeasons franchise={franchise} currentId={anime.id} />
      )}

      <MappingSection
        resolved={resolved}
        mediaId={mediaId}
        routeId={routeId}
        totalChapters={totalChapters}
        badge={badge}
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
  content: {
    padding: SPACE.xl,
    gap: SPACE.xxxl,
    paddingBottom: SPACE.pageEndTall,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: { ...TEXT.sectionTitle, color: COLOR.textPrimary },
  empty: {
    color: COLOR.textMuted,
    fontFamily: FONT.regular,
    paddingTop: SPACE.md,
  },
  spinnerWrap: { paddingTop: SPACE.lg },
  volumesBlock: { gap: SPACE.lg },
  sourcesWrap: { paddingTop: SPACE.md },
  sources: {
    paddingTop: SPACE.lg,
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
