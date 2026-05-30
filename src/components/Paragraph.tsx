import { Text, type TextProps } from 'react-native';

export function Paragraph(props: TextProps) {
  return (
    <Text
      {...props}
      // @ts-expect-error react-native-web maps `accessibilityRole="paragraph"` to a `<p>` element; the role isn't in RN's `AccessibilityRole` type alias, which can't be declaration-merged.
      accessibilityRole="paragraph"
    />
  );
}
