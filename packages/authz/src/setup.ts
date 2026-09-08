import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { OpenFgaClient } from "@openfga/sdk";
import { transformer } from "@openfga/syntax-transformer";
import { parseEnv, openfgaEnvSchema } from "@qislearn/config/env";

const env = parseEnv(openfgaEnvSchema);

const modelPath = fileURLToPath(new URL("../model.fga", import.meta.url));
const dsl = readFileSync(modelPath, "utf-8");
const model = transformer.transformDSLToJSONObject(dsl);

async function main() {
  const bootstrapClient = new OpenFgaClient({ apiUrl: env.OPENFGA_API_URL });

  const storeId = env.OPENFGA_STORE_ID ?? (await createStore(bootstrapClient));
  const client = new OpenFgaClient({ apiUrl: env.OPENFGA_API_URL, storeId });

  const { authorization_model_id: authorizationModelId } = await client.writeAuthorizationModel(model);

  console.log(`OPENFGA_STORE_ID=${storeId}`);
  console.log(`OPENFGA_MODEL_ID=${authorizationModelId}`);
}

async function createStore(client: OpenFgaClient): Promise<string> {
  const { id } = await client.createStore({ name: "qislearn" });
  if (!id) {
    throw new Error("OpenFGA did not return a store id");
  }
  return id;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
