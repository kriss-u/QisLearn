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
