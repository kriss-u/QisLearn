import type { YogaInitialContext } from "graphql-yoga";
import type { AuthzClient } from "@qislearn/authz";
import { auth } from "./auth.js";
import { authz } from "./authz.js";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export interface GraphQLContext {
  session: NonNullable<Session>["session"] | null;
  user: NonNullable<Session>["user"] | null;
  authz: AuthzClient;
}

export async function createContext({ request }: YogaInitialContext): Promise<GraphQLContext> {
  const session = await auth.api.getSession({ headers: request.headers });

  return {
    session: session?.session ?? null,
    user: session?.user ?? null,
    authz,
  };
}
