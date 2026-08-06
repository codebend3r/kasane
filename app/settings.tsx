import { ScrollView, StyleSheet, Text } from "react-native";
import { Footer } from "@/components/Footer";
import { COLOR, FONT } from "@/theme";

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Account</Text>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.muted}>Settings are coming soon.</Text>
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: 12, padding: 16, paddingBottom: 40 },
  eyebrow: {
    color: COLOR.accent,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: COLOR.textPrimary,
    fontSize: 24,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  muted: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
});
