import "react-native";
import type { MouseLike } from "@/types";

type CornerShape = "bevel" | "round" | "notch" | "scoop" | "squircle";

declare module "react-native" {
  // react-native-web reports hover and focus on the style callback state;
  // native never sets them, so they stay optional.
  interface PressableStateCallbackType {
    readonly hovered?: boolean;
    readonly focused?: boolean;
  }
  interface PressableProps {
    /** Forwarded to the DOM element by react-native-web; ignored on native. */
    onMouseMove?: (event: MouseLike) => void;
  }
  interface ViewStyle {
    cornerShape?: CornerShape;
    cornerTopLeftShape?: CornerShape;
    cornerTopRightShape?: CornerShape;
    cornerBottomLeftShape?: CornerShape;
    cornerBottomRightShape?: CornerShape;
  }
  interface ImageStyle {
    cornerShape?: CornerShape;
    cornerTopLeftShape?: CornerShape;
    cornerTopRightShape?: CornerShape;
    cornerBottomLeftShape?: CornerShape;
    cornerBottomRightShape?: CornerShape;
  }
}
