# QisLearn Backend Architecture Plan (v2)

Status: proposal, not yet implemented. This document is the tech-stack decision
record and phased roadmap for turning QisLearn from a static, browser-only SPA
into a monorepo with a Postgres-backed API, database-owned lesson content,
org-scoped auth/authorization, and an LLM-powered adaptive learning layer.

## 1. Goals and constraints

- Move all persisted data (lesson content, user profiles, progress, quizzes,
  assignments, grades, labs) to a Postgres backend. The frontend keeps only
  UI/presentation logic and ephemeral state.
- Remove Dexie entirely; the browser no longer owns any source of truth.
- Everything in Docker for local dev; no production hosting target chosen yet
  (decided: stay environment-agnostic, add Terraform later, optimize for
  "just develop" right now).
- TypeScript-first backend (GraphQL, not REST), latest stable major versions
  throughout, no abandoned/deprecated libraries (ruled out Lucia, wary of
  Prisma's agent-platform direction).
- Auth: better-auth with organization scoping (university/school as tenant).
- Authorization: real ReBAC/ABAC capability model (`can_view_lesson`,
  `can_edit_lesson`, org-scoped), not flat roles.
- LLM: provider-agnostic (OpenRouter, direct Anthropic/OpenAI, local models
  via Ollama), swappable without rearchitecting.
- Adaptive learning v1: difficulty/path adjustment, LLM-driven tutoring and
  hints, spaced-repetition mastery tracking.
- Content (lesson MDX) also moves into Postgres, becoming DB-editable.

## 2. Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Monorepo tooling | pnpm workspaces + Turborepo | Fast incremental builds/caching, simple `turbo.json` pipeline, works cleanly with polyglot packages (a Python or Go service just sits in `apps/` outside the pnpm graph) |
| Language (backend) | TypeScript | Matches existing frontend, one language for most of the stack, per your preference |
| API style | GraphQL (GraphQL Yoga + Pothos) | Pothos gives code-first schema building with full type inference straight from your Drizzle schema; Yoga is the actively maintained, spec-compliant, framework-agnostic GraphQL server (Envelop plugin ecosystem, subscriptions support for future real-time features) |
| ORM | Drizzle ORM + drizzle-kit | Fully TypeScript, SQL-shaped query builder (no black-box query engine), first-class Postgres support, official `@pothos/plugin-drizzle` auto-generates GraphQL types/fields from your Drizzle schema and solves N+1 via Drizzle's relational queries. Chosen over Prisma: Prisma 7 (Nov 2025) dropped its Rust engine and is materially better, but Prisma is now pushing "Prisma Postgres," Accelerate, and an agent/MCP-server platform play, exactly the "agentic workflow" drift you flagged. Drizzle stays a plain, boring ORM. |
| Database | PostgreSQL (latest stable) | Required; also backs OpenFGA's tuple store and better-auth |
| Auth | better-auth + official `organization` plugin | Actively maintained TS-native auth, owns its own Postgres tables (via the Drizzle adapter), the `organization` plugin gives you orgs/teams/invitations with per-org custom roles out of the box, exactly the "university-scoped login" shape. Pairs with the separate `admin` plugin for app-wide (non-org) administration, no conflict between the two. Lucia is dead (deprecated March 2025, now just an architecture guide, not a library) so it was never in consideration. |
| Authorization | OpenFGA (self-hosted, Docker) | A real Zanzibar-style ReBAC engine: relationship tuples like `user:alice is member of org:mit`, `org:mit owns lesson:bell-state`, `member can view lesson`. Models "can_view_lesson"/"can_edit_lesson" as first-class relations instead of hand-rolled boolean checks, and scales to nested org/course/lesson graphs without new code. Runs as its own container (`openfga/openfga` image) with its own store, checked from Pothos resolvers via `@openfga/sdk`. |
| LLM gateway | Self-hosted LiteLLM proxy container, fronting OpenRouter + direct Anthropic/OpenAI + local Ollama | LiteLLM speaks one OpenAI-compatible API and routes to 100+ backends via YAML config, including OpenRouter as just one more upstream. This is what actually delivers "swap any model, local or cloud" without rewriting the app: your code always calls one endpoint, only the LiteLLM config changes. Vercel AI SDK is a good *client-side* abstraction but isn't a substitute for a self-hosted routing/budget/fallback layer; keep it in mind for the `llm-service`'s own SDK use against LiteLLM's endpoint if it simplifies streaming/tool-calling code. |
| LLM service language | TypeScript (`apps/llm-service`), calling the LiteLLM container | Keeps custom code in one language; the polyglot piece (LiteLLM) is an off-the-shelf image you configure, not code you maintain. Reassess later if adaptive-learning logic wants LangGraph-style agent orchestration, Python's ecosystem is stronger there, and the service boundary already exists to swap it in without touching the rest of the system. |
| Frontend data layer | GraphQL Codegen (client preset) + urql | Fully typed queries/mutations generated from the schema, urql's normalized cache replaces a chunk of what Dexie + zustand were doing for server data. Zustand stays, but scoped down to genuinely ephemeral UI state (editor draft state before it's saved, sidebar open/closed, theme), not persisted app data. |
| Validation | zod (frontend forms/props), drizzle-zod (backend, generated from schema) | Keeps validation colocated with the source of truth instead of hand-duplicated shapes |
| Containerization | Docker + docker-compose (dev), Dockerfile per app | One `docker-compose.yml` for local dev: postgres, openfga (+ its own postgres or shared instance with a separate database), litellm, api, llm-service, web. A `terraform/` directory is stubbed now (empty modules, no provider chosen) so infra-as-code has a home once a hosting target is picked, but nothing is built there yet. |

## 3. Monorepo layout

```
qislearn/
  apps/
    web/            # current React 19 + react-router SPA, trimmed of Dexie/db code
    api/             # GraphQL Yoga + Pothos server, Drizzle schema, better-auth, OpenFGA client
    llm-service/     # thin TS service: tutoring/hints/adaptive endpoints, calls LiteLLM
  packages/
    db/              # Drizzle schema + migrations, shared by api and any admin/CLI tooling
    graphql-schema/  # generated SDL + codegen output consumed by web
    config/          # shared tsconfig, eslint/oxlint config, env schema (zod)
    ui/              # (optional, later) shared design-system pieces if ever split from web
  infra/
    docker/          # Dockerfiles per app
    terraform/        # empty stub modules, filled in once a hosting target is chosen
  docker-compose.yml
  docker-compose.override.yml   # dev-only overrides (bind mounts, hot reload)
  turbo.json
  pnpm-workspace.yaml
  package.json
```

`apps/web` keeps `react-router` framework mode exactly as today; it becomes a
GraphQL client instead of a Dexie owner. Nothing about routing, Chakra, the
CodeMirror editor, the statevector simulator, or the visualization components
needs to change, those are pure frontend concerns and stay as-is.

## 4. Data model (Postgres, via Drizzle)

Core tables, grouped by domain. Exact columns will firm up during
implementation; this is the shape.

**Identity / orgs** (mostly owned by better-auth's schema, extended)
- `user` (better-auth managed): id, email, name, image, emailVerified, ...
- `organization`, `member`, `invitation` (better-auth `organization` plugin):
  org = university/school; member = user's role/status within an org
- `session`, `account` (better-auth managed): sessions, linked OAuth accounts

**Authorization** (relationship tuples live in OpenFGA's own store, not here)
- App tables only need the *resource* side: which org a lesson/track belongs
  to, which user authored it. OpenFGA tuples express the rest: `user #member
  of org`, `org #parent of track`, `track #parent of lesson`, plus relations
  `can_view` / `can_edit` derived from those in the OpenFGA authorization
  model (the `.fga` model file, checked into `packages/db` or its own
  `packages/authz`).

**Content** (replaces `src/content/lessons/*.mdx` + `src/content/schema.ts`)
- `track`: id, slug, title, order
- `lesson`: id, slug (stable, mirrors today's `id`), trackId, order, title,
  summary, layout, estimatedMinutes, orgId (nullable = global/public content)
- `lesson_prerequisite`: lessonId, prerequisiteLessonId (replaces the
  frontmatter `prerequisites` array as a proper edge table)
- `content_block`: id, lessonId, order, type, data (jsonb). This is the
  direct DB equivalent of today's MDX body: a lesson is an ordered list of
  blocks instead of one compiled MDX file. `markdown` blocks hold the prose
  (LaTeX-in-`$...$` conventions unchanged); every other block type holds
  exactly the props the matching JSX component takes today. `type` is free
  text — the JSX tag name (`CodeExercise`, `Quiz`, `Visualization`,
  `Measurement`, plus one-off lesson widgets like `OracleFigure`,
  `ComplexPlaneExplorer`, `TensorProductBuilder`, `GroverRotationPlayground`,
  `QFTPhaseWheel`, `PhaseEstimationPlayground`,
  `ModularExponentiationExplorer` — the real lesson set uses 11 distinct
  interactive components, not a small fixed set), not a Postgres enum: a
  fixed enum would need a migration every time a lesson author adds a new
  one-off widget, which happens often enough (each algorithm lesson tends to
  bring its own bespoke visualization) that it isn't worth constraining.
  `data`'s shape per type is validated against `content/schema.ts`'s
  existing zod schemas (`Circuit`, `GateSchema`, `QuizChoice`, etc, for the
  four original components) or the interactive component's own prop
  interface for the others; not yet enforced at the DB layer via
  drizzle-zod, since `data` is a single jsonb column shared across all
  types rather than one column per type.

**Progress / grading**
- `lesson_progress`: userId, lessonId, status, updatedAt (replaces Dexie's
  progress store)
- `code_snapshot`: userId, lessonId, exerciseId, code, updatedAt (replaces
  Dexie's per-exercise saved code)
- `quiz_attempt`: userId, lessonId, quizId, selectedChoiceId, submitted,
  submittedAt
- `assignment`, `assignment_submission`, `grade`: new concepts not present
  today, instructor-authored assignments scoped to a track/org, submissions,
  and grades tied back to a submission
- `lab`: new concept, likely a superset of `lesson` for longer-form graded
  work; model as a `lesson` with `type = 'lab'` rather than a parallel table
  unless requirements diverge

**Adaptive learning**
- `concept_mastery`: userId, conceptTag, masteryScore, lastReviewedAt,
  nextReviewAt (SM-2-style spaced repetition scheduling)
- `learning_path_event`: userId, lessonId, eventType (struggled/mastered/
  skipped), createdAt, feature vector for the difficulty-adjustment rules
  engine to read
- `tutoring_interaction`: userId, lessonId, exerciseId, prompt, response,
  model, createdAt, feedback (thumbs up/down), an audit log of every LLM
  hint/tutoring exchange, both for product iteration and for feeding future
  personalization

## 5. GraphQL API layer

- Pothos schema builder with `@pothos/plugin-drizzle` for entity types,
  `@pothos/plugin-relay` if pagination needs cursors, `@pothos/plugin-scope-auth`
  for field/type-level authorization scopes (the scope-check function calls
  the OpenFGA client's `.check()`, fail closed on any error), and
  `@pothos/plugin-validation` for zod-backed argument validation on
  mutations instead of hand-rolled input checks.
- GraphQL Yoga as the HTTP layer: `apps/api` exposes `/graphql`, wraps Yoga's
  Envelop plugin chain with a production-hardening set rather than a bare
  server, since this becomes a public API surface once orgs/students hit it
  directly:
  - **`@escape.tech/graphql-armor`** (the actively maintained, widely-used
    security middleware for Yoga/Envelop/Apollo): its `max-depth`,
    `cost-limit`, `block-field-suggestions`, max-aliases and max-directives
    plugins together stop the classic GraphQL DoS shapes (deeply nested
    queries, alias-multiplication, batched-query cost bombs) and schema
    introspection leakage, with sane defaults (depth 6, cost 5000) tuned per
    field as the schema grows.
  - **`@envelop/rate-limiter`**: per-field `@rateLimit(window, max, message)`
    directive, applied to the mutations that matter most for abuse/cost
    (LLM hint requests, quiz/exercise submissions, invite creation), backed
    by Redis once there's more than one `api` instance so limits are shared
    across replicas.
  - **`@graphql-yoga/plugin-csrf-prevention`** (official Yoga plugin): blocks
    simple-request CSRF by requiring a custom header, relevant because
    better-auth's session cookie makes the API a cookie-authenticated
    surface, not just bearer-token.
  - **Persisted operations**: Yoga's built-in persisted-operations support
    (APQ-style hash locking) turned on for the production frontend once
    `apps/web` is stable, so the public endpoint only ever executes
    pre-approved queries/mutations, not arbitrary client-supplied GraphQL.
  - Error masking left on (Yoga's default) so internal errors/stack traces
    never reach the client; resolvers throw typed `GraphQLError`s with
    explicit `extensions.code` for anything the frontend needs to branch on.
  - `@pothos/plugin-complexity` is worth revisiting at implementation time
    for Pothos-native per-field cost annotations (more precise than Armor's
    generic cost heuristic), confirm its current package name/maintenance
    status against pothos-graphql.dev before adopting; Armor's `cost-limit`
    plugin alone is a reasonable v1 if it turns out to be unmaintained.
- `graphql-codegen` with the client preset generates typed documents into
  `packages/graphql-schema` for `apps/web` to import, no hand-written query
  strings, no runtime schema mismatches.
- better-auth mounts its own HTTP handler alongside Yoga in `apps/api`
  (session cookie/JWT verified in the GraphQL context function); GraphQL
  resolvers never touch auth logic directly, they read `ctx.session.user`.

## 6. LLM / adaptive learning service

- `infra/docker` runs a LiteLLM proxy container configured with multiple
  model routes: OpenRouter (catch-all for hosted models), direct Anthropic
  and OpenAI keys where you want provider-specific features, and an Ollama
  route for local models. Config lives in one YAML file, checked into
  `infra/docker/litellm-config.yaml`, so adding/removing a model is a config
  change, not a code change.
- `apps/llm-service` (TS) is the only thing that talks to LiteLLM. It owns:
  - **Tutoring/hints endpoint**: given a lesson/exercise/quiz context and the
    learner's current code or wrong answer, produces a hint. Logged to
    `tutoring_interaction`.
  - **Difficulty/path adjustment**: a rules engine (not LLM-driven, cheap and
    deterministic) reading `learning_path_event`/`quiz_attempt` to decide
    whether to recommend remediation or let the learner skip ahead. Exposed
    to `apps/api` as an internal call, surfaced to the frontend as a
    "recommended next lesson" field on the user's progress query.
  - **Spaced repetition scheduler**: an SM-2 (or a simpler exponential
    backoff to start) implementation updating `concept_mastery.nextReviewAt`
    whenever a quiz/exercise tied to that concept is attempted.
  - LLM calls to LiteLLM's OpenAI-compatible endpoint via the Vercel AI SDK's
    OpenAI-compatible provider, giving you streaming and structured output
    helpers without coupling to any specific model vendor's SDK.
- `apps/api` calls `apps/llm-service` over internal HTTP (plain REST is fine
  here, it's service-to-service, not the public API surface).

## 7. Content migration (MDX to Postgres)

1. Write a one-time migration script (`packages/db/scripts/migrate-mdx.ts`)
   that: reads every `src/content/lessons/*.mdx`, parses frontmatter (same
   `yaml` parsing already used in `content/index.ts`) into `lesson` rows,
   then parses the MDX body's AST (via the `@mdx-js/mdx` compiler's syntax
   tree, not a regex) to walk top-level nodes: prose between custom tags
   becomes `content_block` rows of type `markdown`, and each
   `<CodeExercise>`/`<Quiz>`/`<Visualization>`/`<Measurement>` JSX node's
   props become a `content_block` row of the matching type with `data` set
   to exactly those props (already zod-validated shapes, no new schema
   design needed).
2. Run it once against every existing lesson, diff the resulting DB content
   render against the current live site lesson-by-lesson before deleting any
   `.mdx` file, so nothing is lost silently.
3. Only after migration is verified, remove `@mdx-js/rollup`, the MDX
   Vite plugin config, and `src/content/lessons/*.mdx` from the frontend
   build. `LessonPage` switches from `loadLessonContent()`'s dynamic MDX
   import to a GraphQL query for the lesson's ordered `content_block` list,
   rendered by a small block-type switch (`markdown` block through the
   existing `Markdown` component, the other three through the existing
   `CodeExercise`/`Quiz`/`Visualization`/`Measurement` components, unchanged
   except their props now come from a query result instead of MDX-compiled
   JSX props).
4. A minimal authoring path for v1: direct GraphQL mutations (or a Drizzle
   Studio-style DB GUI) editing `content_block` rows. A real authoring UI
   (drag-to-reorder blocks, live preview) is explicitly out of scope for the
   first cut, tracked as a later phase.

## 8. Docker Compose (dev) sketch

Services: `postgres`, `openfga` (plus its own migration/init step against
postgres), `litellm`, `api`, `llm-service`, `web`. `docker-compose.yml`
defines the production-shaped services; `docker-compose.override.yml` (auto-
merged by Compose in dev) adds bind mounts and dev commands (`turbo dev`)
so editing source doesn't require a rebuild. `.env.example` at the repo root
enumerates every variable each service needs (DB URL, better-auth secret,
OpenFGA store/model IDs, LiteLLM master key, model API keys), and each app
validates its own subset at startup via a zod-parsed env schema in
`packages/config`, fail fast on a missing var rather than a runtime crash
three requests in.

## 9. Phased roadmap

1. **Scaffold**: pnpm workspace, Turborepo pipeline, move `apps/web` in
   place (current repo content, working exactly as today, no behavior
   change yet), empty `apps/api` and `apps/llm-service` stubs, base
   `docker-compose.yml` with just `postgres` up and reachable.
2. **Auth + org + authz skeleton**: better-auth wired into `apps/api` with
   Drizzle adapter and the `organization` plugin, OpenFGA container running
   with a minimal authorization model (user/org/member relations only, no
   content relations yet), a "who am I" GraphQL query end to end.
3. **Content schema + migration**: Drizzle schema for `track`/`lesson`/
   `content_block`, the MDX-to-Postgres migration script, GraphQL queries to
   read lessons/blocks, `apps/web` switched to read lessons from GraphQL
   instead of the MDX registry, verified lesson-by-lesson against the
   current site before deleting any `.mdx` file.
4. **User data cutover**: `lesson_progress`/`code_snapshot`/`quiz_attempt`
   tables and mutations, `apps/web` switched off Dexie entirely (delete
   `src/db/`), zustand stores trimmed to ephemeral-only state, OpenFGA
   content relations (`can_view_lesson`/`can_edit_lesson`) enforced on the
   relevant queries/mutations.
5. **Assignments/labs/grades**: new domain tables and GraphQL types,
   instructor-facing mutations gated by OpenFGA `can_edit_lesson`-style
   relations scoped per org.
6. **LLM service v1**: LiteLLM container plus `apps/llm-service`'s tutoring/
   hints endpoint, wired into `<CodeExercise>`'s hint UI as an additional
   "ask for a hint" action alongside the existing static `hints` prop.
7. **Adaptive learning**: `concept_mastery`/`learning_path_event` tables,
   the difficulty/path rules engine, spaced-repetition scheduling, surfaced
   in the UI as a "recommended next" lesson and a review queue.
8. **Deploy target decision**: revisit hosting once the app is feature-
   complete enough to need a real environment; fill in `infra/terraform`
   for whichever target is chosen then, no earlier.

## 10. Open questions to resolve during implementation

- Exact multi-tenancy boundary: is *all* content org-scoped, or is there a
  shared public course catalog plus optional org-specific tracks/overrides?
  Affects whether `lesson.orgId` is nullable-for-global or every org gets
  its own copy.
- Whether `code_snapshot` needs versioning/history (currently Dexie just
  overwrites) now that it's a natural audit/grading signal.
- Rate limiting and cost controls on the LLM tutoring endpoint per user/org
  (LiteLLM supports budgets/rate limits natively, needs concrete numbers).
- Whether OpenFGA's authorization model should be hand-written now or
  derived from a smaller v1 (user/org only) and extended once content
  relations are actually needed, avoiding premature modeling of relations
  that don't exist yet.

## 11. Version notes (checked September 2026)

- Drizzle ORM + drizzle-kit: current stable, actively maintained.
- `@pothos/plugin-drizzle`: official, actively released (v0.17.x line),
  built on Drizzle's relational query API.
- better-auth: current, `organization` plugin is official and covers the
  university-scoped-login requirement directly; pair with the `admin`
  plugin for app-wide administration.
- OpenFGA: current, Node SDK is `@openfga/sdk`, actively released; Docker
  image is `openfga/openfga`.
- Prisma 7 (Nov 2025) dropped its Rust query engine (pure TS/WASM now,
  smaller/faster) but is simultaneously building out "Prisma Postgres,"
  Accelerate, and an agent/MCP-server platform, the drift you flagged.
- Lucia is deprecated (March 2025) and no longer a library to install, only
  an architecture guide; not a candidate here.
- LiteLLM is the right self-hosted layer for "any provider, local or cloud";
  OpenRouter is best used as one upstream *inside* LiteLLM rather than a
  replacement for it.

Pin exact patch/minor versions at scaffold time (phase 1) rather than in
this document, so the plan doesn't go stale the moment a dependency ships a
release.
