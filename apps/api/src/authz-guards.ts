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

// Course entitlement: true iff the caller is the global superadmin (code-
// level bypass — FGA has no clean "admin of every object of this type"
// relation without per-object tuples), or a `member` (per organization's
// own relation) of some organization the course has been `offered_to`
// (packages/authz/model.fga `course#can_view_course`). Covers a personal-
// org admin, a team-org admin, and a team-org member identically — no
// special-casing per actor kind.
export async function requireCourseOffered(ctx: GraphQLContext, courseId: string) {
  const user = requireUser(ctx);
  if (user.role === "admin") return;
  const allowed = await ctx.authz.check({
    user: `user:${user.id}`,
    relation: "can_view_course",
    object: `course:${courseId}`,
  });
  if (!allowed) {
    throw new GraphQLError("This course isn't offered to your organization.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

// Org-admin-ship (personal or team) via the existing
// `organization#can_manage_org` relation — works identically for a
// personal org's sole admin and a team org's admin.
export async function requireOrgAdmin(ctx: GraphQLContext, organizationId: string) {
  const user = requireUser(ctx);
  const allowed = await ctx.authz.check({
    user: `user:${user.id}`,
    relation: "can_manage_org",
    object: `organization:${organizationId}`,
  });
  if (!allowed) {
    throw new GraphQLError("You must be an admin of this organization.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}
