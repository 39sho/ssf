/** Runtime exhaustiveness assertion for FieldKind switches. */
export function assertNever(x: never): never {
  throw new Error(`[ssf] Unexpected unreachable value: ${String(x)}`);
}
