import "react-native";

type CornerShape = "bevel" | "round" | "notch" | "scoop" | "squircle";

declare module "react-native" {
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
