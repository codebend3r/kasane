import { Platform, Text, type TextProps } from 'react-native';

// react-native-web maps `accessibilityRole="paragraph"` to a `<p>` element; on
// native, "paragraph" isn't a valid `AccessibilityRole` and throws at runtime.
// The role isn't in RN's `AccessibilityRole` type alias, which can't be
// declaration-merged.
// @ts-expect-error see comment above
const paragraphRoleProps: TextProps =
  Platform.OS === 'web' ? { accessibilityRole: 'paragraph' } : {};

export function Paragraph(props: TextProps) {
  return <Text {...props} {...paragraphRoleProps} />;
}
