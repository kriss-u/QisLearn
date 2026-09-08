import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { createContext } from "./context.js";
import { env } from "./env.js";
import { schema } from "./schema.js";

const authHandler = toNodeHandler(auth);
// better-auth's session is a cookie, and apps/web calls this API directly
// from the browser (a different origin/port in dev) — both the GraphQL
// endpoint and the auth handler need CORS with credentials for that cookie
// to be sent/read cross-origin.
const corsOptions = { origin: env.WEB_URL, credentials: true };
const yoga = createYoga({ schema, context: createContext, graphqlEndpoint: "/graphql", cors: corsOptions });

const server = createServer((req, res) => {
  if (req.url?.startsWith("/api/auth")) {
    // Yoga applies `corsOptions` to /graphql itself; better-auth's raw node
    // handler doesn't, so the same headers are set by hand here.
    res.setHeader("Access-Control-Allow-Origin", corsOptions.origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    authHandler(req, res);
    return;
  }
  yoga(req, res);
});

server.listen(env.PORT, () => {
  console.log(`api listening on http://localhost:${env.PORT}/graphql`);
  console.log(`better-auth mounted at http://localhost:${env.PORT}/api/auth`);
});
