import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      health: String!
    }
  `,
  resolvers: {
    Query: {
      health: () => "ok",
    },
  },
});

const yoga = createYoga({ schema });
const server = createServer(yoga);

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`api listening on http://localhost:${port}/graphql`);
});
