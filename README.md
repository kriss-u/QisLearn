# QisLearn

A course platform — content authors build multi-track courses (lessons, a
code editor, static circuit checking, live visualizations) and organizations
(including a solo learner's own personal one) pick which courses their
members study. Today it hosts one course,
[Qiskit](https://www.ibm.com/quantum/qiskit)/quantum computing, but the
platform itself isn't quantum-specific — course, track, and lesson are
generic entities; nothing structural assumes the subject matter.

This is a pnpm + Turborepo monorepo. `apps/web` server-renders lessons
fetched over GraphQL from `apps/api`, which is Postgres-backed
(Drizzle) with better-auth (email/password, organizations) and OpenFGA
(course entitlement — which organization can see which course) — signing
in is required to browse any course content. An LLM/adaptive-learning
service (`apps/llm-service`) is still a stub; see
**[docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md)** for the architecture
decision record.

> **Working on this repo, human or agent?** See **[AGENTS.md](./AGENTS.md)** for the
> architecture, conventions, and Qiskit-specific correctness rules (bit ordering
> etc.) before making changes.

## Features

- **Courses, tracks, and organizations** — a course is a set of tracks; an
  organization (every user gets a personal one automatically, or joins/creates
  a team one) picks which courses its members can study; a site superadmin
  authors content across every course from `/admin`
- **A DB-backed widget catalog** — the interactive components an author can
  drop into a lesson are categorized (math/quantum/science, multi-category)
  and browsable while authoring; a catalog entry with no working component
  yet still shows up (so authors can plan around it) but renders a "not
  implemented yet" placeholder on the real lesson page
- **Step-by-step lessons** mixing reading (with LaTeX), guided code exercises,
  interactive visualizations, and quizzes
- **A real code editor** (CodeMirror 6) with Python syntax highlighting for every
  exercise
- **Static circuit checking** — your Qiskit-style code is parsed with `py-ast` and
  compared against the exercise's expected circuit, no execution required
- **Live visualizations** driven by a small in-browser statevector simulator:
  circuit diagrams, a scrubber to step through gate-by-gate state evolution, the
  Bloch sphere (3D, via three.js), state amplitude charts, and measurement
  probability bars
- **Progress persists to your account** — lesson status, saved code, and quiz
  answers are Postgres-backed (`apps/api`), tied to your login, not the browser
- **Per-lesson layouts** — reading-heavy lessons, circuit-focused workspaces, and
  full lab-style lessons each get a layout suited to their content

## Getting started

`apps/web` now server-renders lessons fetched over GraphQL from `apps/api`
(Postgres-backed), so the full stack needs Postgres + OpenFGA + `apps/api`
running, not just the frontend. `docker-compose.yml` brings all of it up
with one command:

```bash
cp .env.example .env
docker compose up -d postgres openfga
pnpm install
pnpm --filter @qislearn/db db:migrate
pnpm --filter @qislearn/authz authz:setup   # prints OPENFGA_STORE_ID / OPENFGA_MODEL_ID — put them in .env
docker compose up -d                        # postgres, openfga, api, web — hot-reloading dev servers
```

Then open http://localhost:5173. `api`/`web` run inside containers with the
repo bind-mounted in (edits on your machine hot-reload inside the
container); `docker compose logs -f api web` follows their output.

If you'd rather run `apps/web`/`apps/api` directly on your machine instead
of in containers (faster iteration, no Docker overhead for the Node
processes themselves — `postgres`/`openfga` still need Docker):

```bash
docker compose up -d postgres openfga
set -a && source .env && set +a
pnpm --filter @qislearn/api dev
pnpm --filter @qislearn/web dev
```

```bash
pnpm --filter @qislearn/web build      # type-check + SSR production build
pnpm --filter @qislearn/web start      # run the production build (react-router-serve)
pnpm --filter @qislearn/web lint       # oxlint
pnpm dev                               # turbo: run every app's dev task (web + api + llm-service stubs)
pnpm build                             # turbo: build every app/package
pnpm lint                              # turbo: lint every app/package
pnpm typecheck                         # turbo: typecheck every app/package
```

See [docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md) for the backend
architecture and migration phases.

## Tech stack

**Frontend** (`apps/web`): TypeScript 7 · React 19 (SSR via react-router) ·
Vite · Apollo Client · Chakra UI v3 · CodeMirror 6 · `py-ast` (static Python
parsing) · three.js / react-three-fiber (Bloch sphere) · Plotly (amplitude
charts) · zustand · zod

**Backend** (`apps/api`): GraphQL Yoga · Drizzle ORM · PostgreSQL ·
better-auth (email/password, organizations) · OpenFGA (course entitlement).
`apps/llm-service` is still an unwired stub. See
[docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md) for the full decision record.

**Monorepo**: pnpm workspaces + Turborepo.

## Project status

Working end to end: course/track/lesson authoring from `/admin` (a
superadmin authors across multiple courses; a track can be shared across
more than one), a DB-backed categorized widget catalog for the
lesson-authoring block picker, personal + team organizations (every signup
gets a closed personal org automatically), org-scoped course entitlement
via OpenFGA, and a full login wall (every route but `/login`/`/signup`
requires a session). Lesson progress, saved code, and quiz answers are
Postgres-backed, tied to your account. See [AGENTS.md](./AGENTS.md) for
known limitations (no real Python execution, no classical registers yet)
and where to extend things.

**Known issue:** the Bloch sphere preview in the admin lesson editor is
unreliable — it can exhaust the browser's WebGL context limit and stop
rendering (sometimes after a refresh), unlike the learner-facing lesson page
where it works fine. See AGENTS.md's "Known limitations" for the root cause
and options going forward (on-demand preview, shared renderer, or a
non-3D/SVG Bloch widget instead of `@react-three/fiber`).

## Author

Made with ❤️ by [Krishna Upadhyay](https://krishnaupadhyay.com.np)
