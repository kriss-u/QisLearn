import type { YogaInitialContext } from "graphql-yoga";
import { auth } from "./auth.js";

export async function createContext({ request }: YogaInitialContext) {
  const session = await auth.api.getSession({ headers: request.headers });

  return {
    session: session?.session ?? null,
    user: session?.user ?? null,
  };
}

export type GraphQLContext = Awaited<ReturnType<typeof createContext>>;
