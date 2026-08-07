import { StyleSheet, Text, View } from "react-native";
import { Paragraph } from "@/components/Paragraph";
import { COLOR, FONT } from "@/theme";

const DEFAULT_BODY =
  "Linear pacing — anime episode count distributed evenly across the manga " +
  "chapter count. Real pacing varies; a curated mapping overrides this " +
  "estimate.";

export function AutoEstimatedBanner({ body }: { body?: string }) {
  return (
    <View style={styles.banner}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AUTO-ESTIMATED</Text>
      </View>
      <Paragraph style={styles.body}>{body ?? DEFAULT_BODY}</Paragraph>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 14,
    backgroundColor: COLOR.surfaceNotice,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.notice,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
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
