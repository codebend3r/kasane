import { useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/**
 * The rendered width of a view, 0 until its first layout. Attach the handler
 * as the view's `onLayout`.
 */
export function useLayoutWidth(): [number, (e: LayoutChangeEvent) => void] {
  const [width, setWidth] = useState(0);
  return [width, (e) => setWidth(e.nativeEvent.layout.width)];
}
