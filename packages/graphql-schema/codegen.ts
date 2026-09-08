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
        // Real TS `enum` output trips the repo's `erasableSyntaxOnly`
        // tsconfig setting (TS7): enums compile to runtime code, which that
        // flag disallows. String-literal union types are erasable and work
        // identically at every GraphQL enum call site used here.
        enumsAsTypes: true,
        scalars: {
          JSON: "Record<string, unknown>",
        },
      },
    },
  },
};

export default config;
