import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.QISLEARN_API_URL ?? "http://localhost:4000/graphql",
  documents: "src/operations/**/*.graphql",
  generates: {
    "src/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        scalars: {
          JSON: "Record<string, unknown>",
        },
      },
    },
  },
};

export default config;
