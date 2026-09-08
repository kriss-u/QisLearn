import { useEffect, useState, type ReactNode } from "react";

export interface ClientOnlyProps {
  children: () => ReactNode;
  fallback: ReactNode;
}

/**
 * Defers rendering `children` until after the first client-side effect, so
 * server-render never attempts a dynamic `import()` of a browser-only
 * dependency (plotly.js, three.js, CodeMirror) that doesn't resolve under
 * Node's strict ESM loader. Server and pre-hydration client both render
 * `fallback`, matching exactly — no hydration mismatch.
 */
export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children()}</> : <>{fallback}</>;
}
