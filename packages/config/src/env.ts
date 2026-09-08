import { z } from "zod";

export function parseEnv<Schema extends z.ZodTypeAny>(
  schema: Schema,
  source: NodeJS.ProcessEnv = process.env,
): z.infer<Schema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    console.error("Invalid environment variables:", z.treeifyError(result.error));
    process.exit(1);
  }
  return result.data;
}

const optionalNonEmpty = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

export const openfgaEnvSchema = z.object({
  OPENFGA_API_URL: z.url().default("http://localhost:8080"),
  OPENFGA_STORE_ID: optionalNonEmpty,
  OPENFGA_MODEL_ID: optionalNonEmpty,
});

export type OpenfgaEnv = z.infer<typeof openfgaEnvSchema>;

export const apiEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url().default("http://localhost:4000"),
  // Browser origin allowed to call this API with credentials (CORS) — the
  // web dev server's origin, not its container-internal hostname.
  WEB_URL: z.url().default("http://localhost:5173"),
  ...openfgaEnvSchema.shape,
  OPENFGA_STORE_ID: z.string().min(1),
  OPENFGA_MODEL_ID: z.string().min(1),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
