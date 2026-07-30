import { ScrollView, StyleSheet, Text } from "react-native";
import { Footer } from "@/components/Footer";
import { FONT } from "@/theme";

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
    color: "#7c5cff",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: FONT.bold,
  },
  title: {
    color: "#f5f5f5",
    fontSize: 24,
    letterSpacing: -0.4,
    fontFamily: FONT.bold,
  },
  muted: { color: "#6b7177", fontSize: 14, fontFamily: FONT.regular },
});
