import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { createContext } from "./context.js";
import { env } from "./env.js";
import { schema } from "./schema.js";

const authHandler = toNodeHandler(auth);
const yoga = createYoga({ schema, context: createContext, graphqlEndpoint: "/graphql" });

const server = createServer((req, res) => {
  if (req.url?.startsWith("/api/auth")) {
    authHandler(req, res);
    return;
  }
  yoga(req, res);
});

server.listen(env.PORT, () => {
  console.log(`api listening on http://localhost:${env.PORT}/graphql`);
  console.log(`better-auth mounted at http://localhost:${env.PORT}/api/auth`);
});
