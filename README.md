# QisLearn

Interactive [Qiskit](https://www.ibm.com/quantum/qiskit) course — lessons, a code
editor, static circuit checking, and live visualizations (Bloch sphere,
statevectors).

This is a pnpm + Turborepo monorepo. The frontend (`apps/web`) still runs fully
client-side today exactly as before: lessons ship as content bundled with the
app, and your progress/saved code live in your browser's IndexedDB. Code you
write is checked statically (parsed, not executed) against what each exercise
expects. A Postgres-backed GraphQL API (`apps/api`) and an LLM/adaptive-learning
service (`apps/llm-service`) are being built out alongside it, see
**[docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md)** for the full architecture
and migration plan; neither is wired into the frontend yet.

> **Working on this repo, human or agent?** See **[AGENTS.md](./AGENTS.md)** for the
> architecture, conventions, and Qiskit-specific correctness rules (bit ordering
> etc.) before making changes.

## Features

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
- **Everything persists locally** via Dexie/IndexedDB — close the tab, come back
  later, pick up where you left off
- **Per-lesson layouts** — reading-heavy lessons, circuit-focused workspaces, and
  full lab-style lessons each get a layout suited to their content

## Getting started

```bash
corepack enable pnpm   # first time only, ships with Node
pnpm install
pnpm --filter @qislearn/web dev
```

Then open the printed local URL. `pnpm --filter @qislearn/web build` produces a
static production bundle (`apps/web/dist/`) that can be hosted anywhere, the
frontend still has no server dependency today.

```bash
pnpm --filter @qislearn/web build      # type-check + production build
pnpm --filter @qislearn/web preview    # serve the production build locally
pnpm --filter @qislearn/web lint       # oxlint
pnpm dev                               # turbo: run every app's dev task (web + api + llm-service stubs)
pnpm build                             # turbo: build every app/package
pnpm lint                              # turbo: lint every app/package
pnpm typecheck                         # turbo: typecheck every app/package
```

`docker-compose.yml` at the repo root brings up Postgres for local backend
development (`docker compose up -d postgres`); the API/LLM services aren't
functional yet, see [docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md).

## Tech stack

**Frontend** (`apps/web`, functional today): TypeScript 7 · React 19 · Vite ·
Chakra UI v3 · Dexie (IndexedDB) · CodeMirror 6 · `py-ast` (static Python
parsing) · three.js / react-three-fiber (Bloch sphere) · Plotly (amplitude
charts) · zustand · zod

**Backend** (`apps/api`, `apps/llm-service`, in progress): GraphQL Yoga ·
Pothos · Drizzle ORM · PostgreSQL · better-auth · OpenFGA · LiteLLM, see
[docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md) for the full decision record.

**Monorepo**: pnpm workspaces + Turborepo.

## Project status

The frontend is an early-stage scaffold: the app shell, content pipeline,
quantum simulator, and three example lessons (qubits, single-qubit gates,
entanglement) are in place and working end to end. It's meant to be built out
lesson by lesson, see [AGENTS.md](./AGENTS.md) for known limitations (no real
Python execution, no classical registers yet) and where to extend things.

The backend is at the scaffolding stage: the monorepo layout, a GraphQL Yoga
stub, an LLM-service stub, and the Drizzle/Postgres wiring exist, but no real
schema, auth, or content migration has landed yet. Lesson content, user
progress, quizzes, and grading all still live entirely in `apps/web` for now.

## Author

Made with ❤️ by [Krishna Upadhyay](https://krishnaupadhyay.com.np)
