import { apiEnvSchema, parseEnv } from "@qislearn/config/env";

export const env = parseEnv(apiEnvSchema);
