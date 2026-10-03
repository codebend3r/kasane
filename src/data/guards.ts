/**
 * A rendered node that can report its on-screen box. react-native-web hands
 * back the DOM element from a `View` ref; native refs have no such method.
 */
export function hasBoundingRect(
  node: unknown,
): node is { getBoundingClientRect: () => DOMRect } {
  return (
    typeof node === "object" &&
    node !== null &&
    "getBoundingClientRect" in node &&
    typeof node.getBoundingClientRect === "function"
  );
}
