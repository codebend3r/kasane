import { StyleSheet, Text, View } from "react-native";
import { Paragraph } from "@/components/Paragraph";
import { COLOR, FONT, SPACE } from "@/theme";

const BODY =
  "Linear pacing — anime episode count distributed evenly across the manga " +
  "chapter count. Real pacing varies; a curated mapping overrides this " +
  "estimate.";

export function AutoEstimatedBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AUTO-ESTIMATED</Text>
      </View>
      <Paragraph style={styles.body}>{BODY}</Paragraph>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: SPACE.lgx,
    backgroundColor: COLOR.surfaceNotice,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.notice,
    gap: SPACE.md,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    backgroundColor: COLOR.notice,
  },
  badgeText: {
    color: COLOR.background,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONT.bold,
  },
  body: {
    color: COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT.regular,
  },
});
