import { useWindowDimensions } from "react-native";
import { NARROW_WIDTH } from "@/theme";

/** True on phone-width windows, where layouts stack and controls tighten. */
export function useIsNarrow(): boolean {
  return useWindowDimensions().width < NARROW_WIDTH;
}
