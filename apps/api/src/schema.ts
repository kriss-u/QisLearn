import { eq } from "drizzle-orm";
import { lesson } from "@qislearn/db/schema";
import { createSchema } from "graphql-yoga";
import { JSONResolver } from "graphql-scalars";
import { db } from "./db.js";
import type { GraphQLContext } from "./context.js";

export const schema = createSchema<GraphQLContext>({
  typeDefs: /* GraphQL */ `
    scalar JSON

    type Query {
      health: String!
      me: User
      tracks: [Track!]!
      lesson(slug: String!): Lesson
    }

    type User {
      id: ID!
      email: String!
      name: String!
    }

    type Track {
      id: ID!
      slug: String!
      title: String!
      order: Int!
      lessons: [Lesson!]!
    }

    type Lesson {
      id: ID!
      slug: String!
      title: String!
      summary: String!
      layout: String!
      order: Int!
      estimatedMinutes: Int!
      track: Track!
      prerequisites: [Lesson!]!
      contentBlocks: [ContentBlock!]!
    }

    type ContentBlock {
      id: ID!
      order: Int!
      type: String!
      data: JSON!
    }
  `,
  resolvers: {
    JSON: JSONResolver,
    Query: {
      health: () => "ok",
      me: (_parent, _args, ctx) => ctx.user,
      tracks: () =>
        db.query.track.findMany({
          orderBy: (t, { asc }) => asc(t.order),
          with: { lessons: { orderBy: (l, { asc }) => asc(l.order) } },
        }),
      lesson: (_parent, args: { slug: string }) =>
        db.query.lesson.findFirst({
          where: eq(lesson.slug, args.slug),
          with: {
            track: true,
            contentBlocks: { orderBy: (cb, { asc }) => asc(cb.order) },
            prerequisites: { with: { prerequisite: true } },
          },
        }),
    },
    Lesson: {
      prerequisites: (parent: { prerequisites?: Array<{ prerequisite: unknown }> }) =>
        (parent.prerequisites ?? []).map((p) => p.prerequisite),
    },
  },
});
