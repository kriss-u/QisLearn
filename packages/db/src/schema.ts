import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

export const placeholder = pgTable("placeholder", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
