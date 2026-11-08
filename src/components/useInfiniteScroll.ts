import { useRef } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
} from "react-native";
import { isNearEnd } from "@/data/infiniteScroll";

/**
 * Infinite scrolling for a `ScrollView`: spread the returned props onto it,
 * and `onEndReached` fires as the reader nears the bottom of the content.
 *
 * A first page shorter than the window never scrolls, so the viewport and the
 * content are measured as they lay out too, and the hook keeps asking until
 * the content overflows. `onOffsetChange` reports every scroll position for
 * anything else that tracks it, such as the home screen's immersive mode.
 * Disabled, the hook hands back no props at all and the list scrolls plainly.
 */
export function useInfiniteScroll({
  enabled,
  onEndReached,
  onOffsetChange,
}: {
  enabled: boolean;
  onEndReached: () => void;
  onOffsetChange?: (offset: number) => void;
}): ScrollViewProps {
  // Scroll geometry, read by the handlers below and never rendered.
  const metrics = useRef({ offset: 0, viewport: 0, content: 0 });

  const checkEnd = () => {
    if (isNearEnd(metrics.current)) onEndReached();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    metrics.current = {
      offset: contentOffset.y,
      viewport: layoutMeasurement.height,
      content: contentSize.height,
    };
    onOffsetChange?.(contentOffset.y);
    checkEnd();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    metrics.current = {
      ...metrics.current,
      viewport: e.nativeEvent.layout.height,
    };
    checkEnd();
  };

  const onContentSizeChange = (_width: number, height: number) => {
    metrics.current = { ...metrics.current, content: height };
    checkEnd();
  };

  return enabled
    ? { onScroll, onLayout, onContentSizeChange, scrollEventThrottle: 16 }
    : {};
}
