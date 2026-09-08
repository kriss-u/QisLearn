import { ApolloClient, HttpLink, InMemoryCache, type NormalizedCacheObject } from "@apollo/client";

// This client is created inside the Root *component* (root.tsx), which
// renders both server- and client-side, so it ends up in the browser
// bundle too — unlike graphqlClient.ts (used only from route `loader`
// exports, which React Router tree-shakes out of the client build). It
// must use `import.meta.env`, not `process.env`: the latter doesn't exist
// in the browser and throws `ReferenceError: process is not defined`.
// The browser always reaches the API at its published host port
// (`localhost:4000`), regardless of whether apps/api runs in Docker or on
// the host — unlike the server-side loader path, which needs the
// container-internal `http://api:4000/graphql` hostname when Dockerized.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

/**
 * Called fresh per request on the server (see root.tsx: created inside the
 * component body via useMemo, not at module scope) so server-rendered
 * requests never share cache state across users; the browser gets one
 * stable instance for the session via the same useMemo.
 */
export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    // `credentials: "include"` sends the better-auth session cookie on
    // every request — needed since apps/api is a different origin/port in
    // dev (see apps/api/src/index.ts's matching CORS config).
    link: new HttpLink({ uri: API_URL, credentials: "include" }),
    cache: new InMemoryCache(),
  });
}
