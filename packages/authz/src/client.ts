import { OpenFgaClient } from "@openfga/sdk";
import type { OpenfgaEnv } from "@qislearn/config/env";

export function createAuthzClient(env: OpenfgaEnv & { OPENFGA_STORE_ID: string; OPENFGA_MODEL_ID: string }) {
  const client = new OpenFgaClient({
    apiUrl: env.OPENFGA_API_URL,
    storeId: env.OPENFGA_STORE_ID,
    authorizationModelId: env.OPENFGA_MODEL_ID,
  });

  return {
    client,
    async check(params: { user: string; relation: string; object: string }) {
      const result = await client.check({
        user: params.user,
        relation: params.relation,
        object: params.object,
      });
      return result.allowed ?? false;
    },
  };
}

export type AuthzClient = ReturnType<typeof createAuthzClient>;
