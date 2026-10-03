import { Redirect, useLocalSearchParams } from "expo-router";

// The series arc route resolves either side's AniList id; this one only
// survives to keep old links working.
export default function LegacyArcRedirect() {
  const { id, arcIdx } = useLocalSearchParams<{ id: string; arcIdx: string }>();
  return (
    <Redirect
      href={{ pathname: "/series/[id]/arc/[arcIdx]", params: { id, arcIdx } }}
    />
  );
}
