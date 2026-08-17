/**
 * `useToken` returns `var(--chakra-colors-...)` references for semantic (light/dark aware)
 * tokens, not literal colors. Setting a canvas `fillStyle`/`strokeStyle` to an unresolved
 * `var(...)` reference silently fails on a detached (never-appended) canvas, since there's no
 * DOM context to resolve the custom property against. Resolve against the live document instead.
 */
export function resolveCssVar(value: string): string {
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!match) return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || value;
}
