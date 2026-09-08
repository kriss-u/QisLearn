import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import * as schema from "@qislearn/db/schema";
import { db } from "./db.js";
import { env } from "./env.js";

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
});
