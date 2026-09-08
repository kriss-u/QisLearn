import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// authClient talks to better-auth's own REST handler (mounted at
// /api/auth on apps/api, see apps/api/src/index.ts), not the /graphql
// endpoint apolloClient.ts uses — so it needs the API's *origin*, derived
// from the same VITE_API_URL env var apolloClient.ts already reads, rather
// than a second env var.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";
const API_ORIGIN = new URL(API_URL).origin;

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut, updateUser } = authClient;
