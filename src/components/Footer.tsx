import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { version } from '../../package.json';
import { FONT } from '@/theme';
import type { PressableState } from '@/types';

export function Footer() {
  return (
    <View style={styles.bar}>
      <Text style={styles.copy}>Built by</Text>
      <Pressable
        onPress={() => Linking.openURL('https://github.com/codebend3r')}
        hitSlop={6}
        style={({ hovered, pressed }: PressableState) => [
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.link}>CJ Rivas</Text>
      </Pressable>
      <View style={styles.spacer} />
      <Text style={styles.version}>v{version}</Text>
      <Pressable
        onPress={() => Linking.openURL('https://github.com/codebend3r')}
        hitSlop={6}
        style={({ hovered, pressed }: PressableState) => [
          { opacity: pressed ? 0.6 : hovered ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.github}>GitHub →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#17181b',
  },
  copy: {
    color: '#6b7177',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  link: {
    color: '#f5f5f5',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  spacer: { flex: 1 },
  version: {
    color: '#6b7177',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
  github: {
    color: '#7c5cff',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: FONT.bold,
  },
});
