import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { COLOR, FONT, pressFeedback, SPACE } from "@/theme";

const SHRINK_MS = 180;

/**
 * The "Kasane" wordmark and its subheading in the global header, linking
 * home. `compact` animates the wordmark down to its phone size and drops the
 * subheading, which the home screen asks for while its grid is being scrolled.
 */
export function HeaderWordmark({
  narrow,
  compact,
  onPress,
}: {
  narrow: boolean;
  compact: boolean;
  onPress: () => void;
}) {
  const [shrink] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(shrink, {
      toValue: compact ? 1 : 0,
      duration: SHRINK_MS,
      useNativeDriver: false,
    }).start();
  }, [compact, shrink]);

  const full = narrow ? styles.wordmarkNarrow : styles.wordmark;
  const small = styles.wordmarkNarrow;
  const wordmarkSize = {
    fontSize: shrink.interpolate({
      inputRange: [0, 1],
      outputRange: [full.fontSize, small.fontSize],
    }),
    lineHeight: shrink.interpolate({
      inputRange: [0, 1],
      outputRange: [full.lineHeight, small.lineHeight],
    }),
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="link"
      accessibilityLabel="Kasane, go to home"
      style={(state) => [styles.pressable, pressFeedback(state)]}
    >
      <Animated.Text
        numberOfLines={1}
        style={[styles.wordmark, narrow && styles.wordmarkNarrow, wordmarkSize]}
      >
        Kasane
      </Animated.Text>
      {/* The wide-tracked subheading is what pushes the header past a phone
          viewport once the back arrow is present, so drop it when narrow. */}
      {!narrow && !compact && (
        <>
          <Text style={styles.subheading}>
            anime <Text style={styles.subAccent}>+</Text> manga
          </Text>
          <View style={styles.rule} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    gap: SPACE.xs,
    flexShrink: 1,
  },
  // Scaled down rather than allowed to shrink-wrap, which broke "Kasane"
  // across two lines on a phone.
  wordmarkNarrow: { fontSize: 34, lineHeight: 38, letterSpacing: -1 },
  wordmark: {
    color: COLOR.textPrimary,
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    fontFamily: FONT.display,
    paddingBottom: SPACE.xxs,
  },
  subheading: {
    color: COLOR.textSecondary,
    fontSize: 13,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
    paddingBottom: SPACE.sm,
  },
  subAccent: {
    color: COLOR.accent,
    fontFamily: FONT.bold,
  },
  rule: {
    height: 4,
    width: 64,
    backgroundColor: COLOR.accent,
  },
});
