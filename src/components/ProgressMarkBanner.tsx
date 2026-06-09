import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FONT } from "@/theme";
import { useProgress, type ProgressSide } from "@/state/progress";

const AUTO_DISMISS_MS = 8000;

export type MarkEvent = {
  side: ProgressSide;
  position: number;
  previous?: number;
  suggestion?: {
    side: ProgressSide;
    position: number;
  };
};

export function ProgressMarkBanner({
  event,
  routeId,
  onDismiss,
}: {
  event: MarkEvent;
  routeId: number;
  onDismiss: () => void;
}) {
  const setSide = useProgress((s) => s.setSide);
  const clearSide = useProgress((s) => s.clearSide);

  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [event, onDismiss]);

  const sideLabel = event.side === "anime" ? "ep" : "ch";
  const otherLabel = event.suggestion?.side === "anime" ? "ep" : "ch";

  const undo = () => {
    if (typeof event.previous === "number") {
      setSide(routeId, event.side, event.previous);
    } else {
      clearSide(routeId, event.side);
    }
    onDismiss();
  };

  const acceptSuggestion = () => {
    if (!event.suggestion) return;
    setSide(routeId, event.suggestion.side, event.suggestion.position);
    onDismiss();
  };

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
          style={({ pressed }) => [
            styles.closeBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>
      {event.suggestion ? (
        <Text style={styles.suggestionText}>
          ≈ {otherLabel} {event.suggestion.position} on the{" "}
          {event.suggestion.side} side
        </Text>
      ) : null}
      <View style={styles.actionsRow}>
        {event.suggestion ? (
          <Pressable
            onPress={acceptSuggestion}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.primaryBtnText}>
              Mark {event.suggestion.side}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={undo}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.secondaryBtnText}>Undo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 14,
    backgroundColor: "#17181b",
    borderLeftWidth: 4,
    borderLeftColor: "#5cff9d",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headline: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 14,
    fontFamily: FONT.bold,
    letterSpacing: -0.2,
  },
  closeBtn: {
    paddingHorizontal: 4,
  },
  closeText: {
    color: "#9aa0a6",
    fontSize: 20,
    lineHeight: 20,
    fontFamily: FONT.bold,
  },
  suggestionText: {
    color: "#cfd2d6",
    fontSize: 13,
    fontFamily: FONT.regular,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#5cff9d",
  },
  primaryBtnText: {
    color: "#0c0c0e",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#2a2a2a",
  },
  secondaryBtnText: {
    color: "#cfd2d6",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
});
