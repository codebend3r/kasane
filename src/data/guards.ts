/** A plain object: not null, not an array. The first step of most guards. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * A rendered node that can report its on-screen box. react-native-web hands
 * back the DOM element from a `View` ref; native refs have no such method.
 */
export function hasBoundingRect(
  node: unknown,
): node is { getBoundingClientRect: () => DOMRect } {
  return (
    isRecord(node) &&
    "getBoundingClientRect" in node &&
    typeof node.getBoundingClientRect === "function"
  );
}
