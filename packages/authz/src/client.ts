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
    async write(tuple: { user: string; relation: string; object: string }) {
      await client.write({ writes: [tuple] });
    },
    async delete(tuple: { user: string; relation: string; object: string }) {
      await client.write({ deletes: [tuple] });
    },
  };
}

export type AuthzClient = ReturnType<typeof createAuthzClient>;
