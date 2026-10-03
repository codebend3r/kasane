import { StyleSheet, Text, View } from "react-native";
import { Paragraph } from "@/components/Paragraph";
import { COLOR, FONT, SPACE } from "@/theme";

const TITLE = "No mapping available yet";

const BODY =
  "We couldn't find an anime↔manga adaptation pair on AniList for this " +
  "entry, and no curated mapping exists for it yet.";

export function NoMappingNotice() {
  return (
    <View style={styles.notice}>
      <Text style={styles.title}>{TITLE}</Text>
      <Paragraph style={styles.body}>{BODY}</Paragraph>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    padding: SPACE.xl,
    backgroundColor: COLOR.surface,
    gap: SPACE.sm,
  },
  title: { color: COLOR.notice, fontFamily: FONT.bold },
  body: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONT.regular,
  },
});
