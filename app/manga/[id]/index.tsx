import { Redirect, useLocalSearchParams } from "expo-router";

// The series screen resolves either side's AniList id, so the side-specific
// detail routes only survive to keep old links working.
export default function LegacyDetailRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: "/series/[id]", params: { id } }} />;
}
