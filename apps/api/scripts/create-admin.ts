import { eq } from "drizzle-orm";
import { user } from "@qislearn/db/schema";
import { auth } from "../src/auth.js";
import { db } from "../src/db.js";

// CLI to create (or promote) an admin/superuser account. Goes through
// better-auth's own `signUpEmail` endpoint rather than inserting into the
// `user`/`account` tables directly, so the password gets hashed exactly the
// way a normal /signup request would — only the role flip afterward is a
// direct DB write, since better-auth has no "create as admin" option.
//
// Usage:
//   pnpm --filter @qislearn/api admin:create --email you@example.com --password 'at-least-8-chars' --name "Your Name"
//
// If the email already has an account, this just promotes it to admin
// (password/name flags are ignored in that case).

interface Args {
  email: string;
  password?: string;
  name?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg?.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      args[key] = value;
      i++;
    }
  }
  if (!args.email) {
    throw new Error(
      "Usage: pnpm --filter @qislearn/api admin:create --email <email> --password <password> --name <name>",
    );
  }
  return { email: args.email, password: args.password, name: args.name };
}

async function main() {
  const { email, password, name } = parseArgs(process.argv.slice(2));

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`Found existing account for ${email}, promoting to admin.`);
  } else {
    if (!password || !name) {
      throw new Error(
        `No account exists for ${email} yet — creating one needs both --password and --name.`,
      );
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    const result = await auth.api.signUpEmail({ body: { email, password, name } });
    userId = result.user.id;
    console.log(`Created account for ${email}.`);
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.id, userId));
  console.log(`${email} is now an admin. Log in at /login and the Admin link will appear in the header menu.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    // The postgres.js pool (via drizzle's `db`) keeps its socket open,
    // which would otherwise leave this script hanging forever instead of
    // exiting after main() resolves.
    process.exit(process.exitCode ?? 0);
  });
