import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLOR, FONT, pressFeedback, SPACE } from "@/theme";
import type { MarkEvent } from "@/components/useMarkProgress";

const AUTO_DISMISS_MS = 8000;

export function ProgressMarkBanner({
  event,
  onUndo,
  onAcceptSuggestion,
  onDismiss,
}: {
  event: MarkEvent;
  onUndo: () => void;
  onAcceptSuggestion: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [event, onDismiss]);

  const sideLabel = event.side === "anime" ? "ep" : "ch";
  const otherLabel = event.suggestion?.side === "anime" ? "ep" : "ch";

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <Text style={styles.headline}>
          Marked {sideLabel} {event.position}{" "}
          {event.side === "anime" ? "watched" : "read"}
        </Text>
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={(state) => [styles.closeBtn, pressFeedback(state)]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
      {!!event.suggestion && (
        <Text style={styles.suggestionText}>
          ≈ {otherLabel} {event.suggestion.position} on the{" "}
          {event.suggestion.side} side
        </Text>
      )}
      <View style={styles.actionsRow}>
        {!!event.suggestion && (
          <Pressable
            onPress={onAcceptSuggestion}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${event.suggestion.side} progress`}
            style={(state) => [styles.primaryBtn, pressFeedback(state)]}
          >
            <Text style={styles.primaryBtnText}>
              Mark {event.suggestion.side}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onUndo}
          accessibilityRole="button"
          accessibilityLabel="Undo this progress mark"
          style={(state) => [styles.secondaryBtn, pressFeedback(state)]}
        >
          <Text style={styles.secondaryBtnText}>Undo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: SPACE.lgx,
    backgroundColor: COLOR.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLOR.success,
    gap: SPACE.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.lg,
  },
  headline: {
    flex: 1,
    color: COLOR.textPrimary,
    fontSize: 14,
    fontFamily: FONT.bold,
    letterSpacing: -0.2,
  },
  closeBtn: {
    paddingHorizontal: SPACE.xs,
  },
  closeText: {
    color: COLOR.textMuted,
    fontSize: 20,
    lineHeight: 20,
    fontFamily: FONT.bold,
  },
  suggestionText: {
    color: COLOR.textSecondary,
    fontSize: 13,
    fontFamily: FONT.regular,
  },
  actionsRow: {
    flexDirection: "row",
    gap: SPACE.md,
    flexWrap: "wrap",
  },
  primaryBtn: {
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.md,
    backgroundColor: COLOR.success,
  },
  primaryBtnText: {
    color: COLOR.background,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  secondaryBtn: {
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.md,
    backgroundColor: COLOR.surfaceRaised,
  },
  secondaryBtnText: {
    color: COLOR.textSecondary,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
});
