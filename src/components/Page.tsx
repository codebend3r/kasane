import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Footer } from "@/components/Footer";
import { COLOR, FONT, SPACE, TEXT } from "@/theme";

/**
 * A scrolling screen with an eyebrow, a title and an optional one-line blurb
 * above its content, and the footer below it.
 */
export function Page({
  eyebrow,
  title,
  blurb,
  children,
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  children?: ReactNode;
}) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {!!blurb && <Text style={styles.blurb}>{blurb}</Text>}
      {children}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { gap: SPACE.lg, padding: SPACE.xl, paddingBottom: SPACE.pageEnd },
  eyebrow: { ...TEXT.eyebrow, color: COLOR.accent },
  title: { ...TEXT.pageTitle, color: COLOR.textPrimary },
  blurb: { color: COLOR.textMuted, fontSize: 14, fontFamily: FONT.regular },
});
