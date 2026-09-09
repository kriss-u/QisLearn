import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin, organization } from "better-auth/plugins";
import { and, eq, isNull } from "drizzle-orm";
import * as schema from "@qislearn/db/schema";
import { db } from "./db.js";
import { env } from "./env.js";
import { authz } from "./authz.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  // better-auth checks the request Origin against this list itself
  // (independent of the CORS headers set in index.ts, which only control
  // whether the *browser* allows the response to be read) — without it,
  // every cross-origin request from apps/web is rejected with
  // "Invalid origin" before CORS even comes into play.
  trustedOrigins: [env.WEB_URL],
  plugins: [organization(), admin()],
  // Every user gets one personal organization, auto-created here, where
  // they're the sole `admin` — see packages/db/src/auth-schema.ts's
  // `organization.isPersonal` comment for why (one code path for "solo
  // user" and "org member" everywhere else: course entitlement, FGA
  // checks, admin role).
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const result = await auth.api.createOrganization({
            body: { name: user.name || user.email, slug: `personal-${user.id}`, userId: user.id },
          });
          if (!result) return;
          await db.update(schema.organization).set({ isPersonal: true }).where(eq(schema.organization.id, result.id));
          await authz.write({ user: `user:${user.id}`, relation: "admin", object: `organization:${result.id}` });
          await authz.write({ user: `user:${user.id}`, relation: "member", object: `organization:${result.id}` });
          // better-auth queues this "after" hook to run once the user row's
          // transaction commits, which races the sign-up flow's own
          // `internalAdapter.createSession` call immediately after —
          // observed in practice landing *before* this hook, so the
          // `session.create.before` hook below finds no membership yet and
          // leaves activeOrganizationId unset. Patch any such session
          // directly here so sign-up doesn't depend on hook ordering.
          await db
            .update(schema.session)
            .set({ activeOrganizationId: result.id })
            .where(and(eq(schema.session.userId, user.id), isNull(schema.session.activeOrganizationId)));
        },
      },
    },
    session: {
      create: {
        // A new session defaults to the user's personal org if nothing
        // else set one — so a fresh sign-in always has *some* active
        // organization for course-entitlement checks to key off, without
        // the client needing to know about personal orgs at all.
        before: async (session) => {
          if (session.activeOrganizationId) return;
          const membership = await db.query.member.findFirst({
            where: eq(schema.member.userId, session.userId),
          });
          if (!membership) return;
          return { data: { ...session, activeOrganizationId: membership.organizationId } };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/organization/invite-member") return;
      const organizationId = ctx.body?.organizationId ?? ctx.context.session?.session.activeOrganizationId;
      if (!organizationId) return;
      const org = await db.query.organization.findFirst({ where: eq(schema.organization.id, organizationId) });
      if (org?.isPersonal) {
        throw new APIError("BAD_REQUEST", {
          message: "Personal organizations are closed — create a separate organization to invite collaborators.",
        });
      }
    }),
  },
});
