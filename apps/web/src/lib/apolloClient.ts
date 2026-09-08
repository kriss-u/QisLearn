import { ApolloClient, HttpLink, InMemoryCache, type NormalizedCacheObject } from "@apollo/client";

const API_URL = process.env.QISLEARN_API_URL ?? "http://localhost:4000/graphql";

/**
 * Called fresh per request on the server (see root.tsx: created inside the
 * component body via useMemo, not at module scope) so server-rendered
 * requests never share cache state across users; the browser gets one
 * stable instance for the session via the same useMemo.
 */
export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new HttpLink({ uri: API_URL }),
    cache: new InMemoryCache(),
  });
}
