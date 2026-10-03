import { ScrollView, StyleSheet, Text } from "react-native";
import { Footer } from "@/components/Footer";
import { COLOR, FONT, SPACE, TEXT } from "@/theme";

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
  content: { gap: SPACE.lg, padding: SPACE.xl, paddingBottom: SPACE.pageEnd },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.accent },
  title: { ...TEXT.pageTitle, color: COLOR.textPrimary },
  muted: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
});
