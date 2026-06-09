import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FONT } from "@/theme";

export type MouseLike = { nativeEvent: { clientX: number; clientY: number } };

type HoverContent = { label: string; color: string; textColor: string };
type Hover = HoverContent & { x: number; y: number };

export function hasBoundingRect(
  node: unknown,
): node is { getBoundingClientRect: () => DOMRect } {
  return (
    typeof node === "object" && node !== null && "getBoundingClientRect" in node
  );
}

export function useHoverLabel() {
  const containerRef = useRef<View>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  const moveTo = (content: HoverContent, e: MouseLike) => {
    const { clientX, clientY } = e.nativeEvent;
    const node = containerRef.current;
    if (hasBoundingRect(node)) {
      const rect = node.getBoundingClientRect();
      setHover({ ...content, x: clientX - rect.left, y: clientY - rect.top });
    } else {
      setHover({ ...content, x: clientX, y: clientY });
    }
  };

  const clearHover = () => setHover(null);

  return { containerRef, hover, moveTo, clearHover };
}

export function HoverLabel({ hover }: { hover: Hover | null }) {
  if (!hover) return null;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.popover,
        {
          backgroundColor: hover.color,
          transform: [
            { translateX: hover.x + 14 },
            { translateY: hover.y + 14 },
          ],
        },
      ]}
    >
      <Text
        style={[styles.popoverText, { color: hover.textColor }]}
        numberOfLines={1}
      >
        {hover.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  popover: {
    position: "absolute",
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 320,
    zIndex: 100,
  },
  popoverText: {
    fontSize: 13,
    letterSpacing: -0.2,
    fontFamily: FONT.bold,
  },
});
