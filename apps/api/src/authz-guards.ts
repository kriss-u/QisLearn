import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context.js";

export function requireUser(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw new GraphQLError("You must be logged in to do this.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.user;
}

export function requireAdmin(ctx: GraphQLContext) {
  const user = requireUser(ctx);
  if (user.role !== "admin") {
    throw new GraphQLError("You must be an admin to do this.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}
