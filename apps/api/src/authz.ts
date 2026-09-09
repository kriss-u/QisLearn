import { createAuthzClient, type AuthzClient } from "@qislearn/authz";
import { env } from "./env.js";

export const authz: AuthzClient = createAuthzClient(env);
