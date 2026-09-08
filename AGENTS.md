# AGENTS.md

Guidance for AI coding agents (and human contributors) working in this repository.

## Monorepo note

This repo is a pnpm + Turborepo monorepo (`apps/web`, `apps/api`,
`apps/llm-service`, `packages/*`, see the root `pnpm-workspace.yaml` /
`turbo.json`). **Everything below this point describes `apps/web`**, the
frontend: every relative path in this file (`src/...`, `vite.config.ts`,
etc.) is relative to `apps/web/`, not the repo root. Run frontend commands
via `pnpm --filter @qislearn/web <script>` from the repo root, or
`cd apps/web` and use `npm run <script>` directly.

The backend (`apps/api`, `packages/db`, `packages/authz`,
`packages/graphql-schema`) is wired into `apps/web` as of the SSR/GraphQL
cutover: lesson content lives in Postgres (`track`/`lesson`/`content_block`
tables) and is served over GraphQL from `apps/api`, which `apps/web`
server-renders through. Auth (better-auth) and authorization (OpenFGA) exist
on the backend from an earlier phase but have no UI in `apps/web` yet, and
user progress/code snapshots are still Dexie-only (not yet migrated to the
backend). `apps/llm-service` is still an unwired stub. See
**[docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md)** for the architecture
decision record and phased roadmap before adding to the backend; don't
introduce backend conventions that contradict it without updating that doc
first.

**Local dev needs the whole stack, not just `apps/web`**, since lesson
content is now fetched from `apps/api`/Postgres at request time (SSR) —
`cd` to the repo root and see `README.md`'s Getting Started for the
one-command `docker compose up -d` flow (or run `apps/api`/`apps/web` on
the host against `docker compose up -d postgres openfga`). A blank/erroring
`apps/web` almost always means `apps/api` or Postgres isn't reachable, not
a frontend bug — check that first.

## What this is

QisLearn is an interactive course for learning quantum computing with Qiskit,
covering everything from "what is a qubit" through entanglement and beyond.
There's still no real Python execution: code the learner writes is
*statically parsed* (via `py-ast`) to check their circuit, not executed.
Lesson content (the old MDX bodies) has been migrated to Postgres and is
served over GraphQL, server-rendered by `apps/web` (`ssr: true`); user
progress and saved code are still browser-only (Dexie/IndexedDB) pending a
later migration to the backend — see `docs/BACKEND_PLAN.md` for what's
already landed vs. still planned.

Read `README.md` first for the product framing. This file is about how the
`apps/web` codebase is put together and the conventions to follow when
changing it.

## Stack

- **Build**: Vite 8 via React Router's framework-mode plugin (`@react-router/dev/vite`),
  real SSR (`ssr: true` in `react-router.config.ts`, `appDirectory: "src/app"`) — no
  more build-time prerendering/static-path enumeration; every route renders
  per-request on a Node server that needs `apps/api` reachable at runtime, not
  just at build. `npm run build` runs `react-router build`, producing
  `build/client` (static assets) and `build/server` (the SSR handler, run via
  `npm run start` → `react-router-serve ./build/server/index.js`). Don't add
  `@vitejs/plugin-react` back alongside `reactRouter()` — both inject a Fast
  Refresh runtime and collide in dev
  (`Identifier 'RefreshRuntime' has already been declared`).
  `vite.config.ts` also force-bundles `@apollo/client` for the SSR build
  (`ssr.noExternal`): that package ships no `package.json` "exports" map, so
  Vite's default SSR externalization leaves a bare `import {...} from
  "@apollo/client"` for Node to resolve, and Node's CJS interop can't
  statically detect its named exports, crashing at server startup. Don't
  remove that `noExternal` entry without re-testing `pnpm build && pnpm start`.
- **Language**: TypeScript 7, React 19
- **UI**: Chakra UI v3 (Ark UI + Panda CSS under the hood: compound component API,
  e.g. `Slider.Root` / `Slider.Track` / `Slider.Thumb`, not the old v2 monolithic
  components). Color mode via `next-themes`, see `src/components/ui/color-mode.tsx`
  (this is Chakra's official snippet, keep it as-is rather than refactoring).
- **Routing**: `react-router` v8, framework mode (single package, no `react-router-dom`).
  Routes are declared in `src/app/routes.ts`; `src/app/root.tsx` is the root layout
  (HTML document `Layout` export + the default-exported `Root` component that wraps
  `<Outlet/>` in `ApolloProvider`/`AppShell`/`Provider` and runs the store-hydration
  effects). Route modules (`src/app/pages/HomePage.tsx`, `LessonPage.tsx`) export a
  `loader` (async, fetches GraphQL data server-side — see Content model below),
  `meta: MetaFunction<typeof loader>` (reads `loaderData`, not a `data` param), and
  a default-exported component reading `useLoaderData<typeof loader>()`. `root.tsx`
  has its own `loader` for sitewide nav data (`AppShell`'s sidebar), threaded down
  as a `tracks` prop rather than read from a shared module import. `npm run dev` /
  `start` go through the `react-router` CLI / `react-router-serve` rather than raw
  `vite dev` / a static file server.
- **State**:
  - `zustand` for in-memory UI/app state (`src/store`)
  - `Dexie` for persisted state in IndexedDB (`src/db`): lesson progress and saved
    code per exercise
  - `zod` for all data validation/schemas (lesson frontmatter, DB records); do not
    hand-roll validation or use raw untyped objects
- **Editor**: CodeMirror 6 via `@uiw/react-codemirror`, Python mode from
  `@codemirror/lang-python`
- **Python analysis**: `py-ast` (a TypeScript Python parser/AST walker). Used to
  statically extract a `Circuit` (gate list, plus optional `name`/`qubitLabels`)
  from learner-written Qiskit-style code without running anything. Recognizes
  `QuantumCircuit(n)`, register-based construction (`QuantumRegister(n, "q")` →
  `QuantumCircuit(qr, ...)`), a `name=` keyword, and both gate-application styles
  (`qc.h(0)` and `qc.append(HGate(), [0])`) as equivalent; see
  `src/features/python/extractCircuit.ts`. Qubit/clbit arguments accept the same
  shapes Qiskit does: a plain int, `register[i]` (resolves to the same index as
  the register's tracked size; real slice objects aren't supported), and, for
  single-qubit gate methods only, a broadcast list (`qc.h([0, 1, 2])` expands to
  three separate `Gate` entries, exactly like Qiskit's own circuit would record).

  It also catches the mistakes real Qiskit/Python would refuse to run, instead of
  silently building a nonsense `Circuit`:
  - an out-of-range qubit or classical-bit index (what Qiskit raises as
    `CircuitError`), checked against the circuit's declared size everywhere a
    gate, `.append(...)`, or `.measure(...)` uses one;
  - `QuantumCircuit`/`QuantumRegister`/`ClassicalRegister`, or a gate class used
    in `.append(...)`, referenced without an import: mirrors Python's
    `NameError`, with a message suggesting the missing `import` line;
  - a circuit variable used before assignment (e.g. calling `.x(0)` on a typo'd
    name); same idea, flagged only when the name matches a known
    circuit-method-shaped call (`CIRCUIT_METHOD_NAMES`) to avoid false positives
    on unrelated code;
  - `.measure(qubits, clbits)` where the two sides resolve to different lengths
    (Qiskit refuses this too; there's no sensible way to zip a 3-qubit list
    against a 2-clbit list).

  `.measure(...)`'s qubit/clbit arguments accept everything Qiskit's does, not
  just a bare int: a `List`/`Tuple`, `range(...)`, or a whole register passed
  directly (every index in it, in order); see `resolveIndexSet` in
  `extractCircuit.ts`. `.measure_all()` and `.measure_active()` are understood
  too, matching real Qiskit: each expands into per-qubit `measure` gates
  targeting a **new** classical register it creates itself (named `"meas"`,
  appended to `Circuit.classicalRegisters`, sized to `numQubits` for
  `measure_all` or to however many qubits a prior gate actually touched for
  `measure_active`), so the checker doesn't choke if a learner tries them, and
  `CircuitDiagram` draws that register as its own classical wire. Still, **no
  lesson exercise's `expectedCircuit` should ever require them**. Per-lesson
  content intentionally standardizes on the explicit `.measure(qubit, clbit)`
  form as the one graded pattern (see `05-measurement.mdx`);
  `measure_all`/`measure_active` are covered as reading-only material, not
  exercised, since which classical register they implicitly create is exactly
  the kind of thing that's clear to *read* but awkward to grade unambiguously.

  All of this is a **single linear pass with no real scope/control-flow
  analysis**: it tracks "what's been imported/assigned so far" as the walk
  proceeds in source order and nothing more (no branches, loops, or function
  bodies). That's deliberately enough for flat lesson-exercise snippets and no
  more; don't reach for a real Python type-checker to extend this further.
- **Quantum simulation**: hand-rolled statevector simulator in
  `src/features/quantum/` (complex numbers, gate matrices, statevector evolution,
  Bloch-vector reduction). No external quantum SDK; it only needs to support the
  gate set lessons actually use.
- **Visualization**:
  - SVG for circuit diagrams (`src/components/viz/CircuitDiagram.tsx`): gate/wire
    label text is set to the brand mono font explicitly (`MONO_FONT` constant,
    `"'Fira Code', ui-monospace, monospace"`), since raw SVG `<text>` doesn't pick
    up Chakra's theme font tokens the way styled components do. The `measure`
    gate renders the standard meter-with-needle glyph (`MeasureGlyph`) instead of
    a text label; keep that distinction if you add other non-unitary
    instructions later; a plain lettered box reads as "gate", the meter reads as
    "measurement", and that's the whole point of the glyph.
  - `three.js` / `@react-three/fiber` / `@react-three/drei` for the Bloch sphere
  - `plotly.js` / `react-plotly.js` for amplitude bar charts
  - Chakra `Progress` for measurement probability bars
- **Content**: lesson bodies are `content_block` rows fetched from `apps/api` over
  GraphQL (see Content model below), rendered by `ContentBlockList.tsx` via
  `react-markdown` (`remark-gfm`, `remark-math`, `rehype-katex`) for `markdown`
  blocks and `mdxComponents.ts`'s component map (keyed by block `type`) for
  everything else. The same `Markdown` component also renders short
  prop-string content (quiz question/choices, exercise prompt/hints).
  `apps/web` no longer compiles or imports `.mdx` files at all (`@mdx-js/rollup`
  was removed from `vite.config.ts`); the `.mdx` files under
  `src/content/lessons/` are now purely the **authoring source for the
  migration script** (`packages/db/scripts/migrate-mdx.ts`), not something the
  app reads directly. See Content model below for the authoring workflow.

## Directory map

```
src/
  app/                    App shell wiring: router, page components
    pages/                  HomePage, LessonPage (continuous-scroll lesson view),
                             both export loader/meta/default — see Routing above
  components/
    ClientOnly.tsx          defers children to after first client effect; wrap
                             any SSR-unsafe/browser-only widget in this
    ui/                   Chakra provider + color-mode snippets (framework glue)
    layout/                AppShell (sidebar nav + header, takes tracks as a
                             prop now, not a module import), ResetDataButton
    editor/                 PyEditor (CodeMirror wrapper)
    viz/                    CircuitDiagram, BlochSphere, StateVectorChart,
                             ProbabilityBars, ShotsHistogram, GateTimeline,
                             VizSection, gateStyles
    lesson/
      ContentBlockList.tsx    renders a lesson's content_block[] (from GraphQL):
                             markdown blocks through Markdown, everything else
                             looked up by type in mdxComponents
      mdx/                   CodeExercise, Quiz, Visualization, Measurement, plus
                             several one-off lesson widgets (OracleFigure,
                             ComplexPlaneExplorer, etc) and MdxCard (shared
                             card chrome) — same components, now driven by
                             content_block.data instead of compiled MDX props
      mdxComponents.ts        the block-type -> component map (was the MDX
                             `components` prop; same map, new consumer)
      markdownElements.tsx    h1/p/code/... overrides shared by mdxComponents.ts
                             and the standalone Markdown.tsx
      Markdown.tsx            renders markdown-string content: both a
                             `markdown` content_block's text and short
                             prop strings (quiz text, exercise prompt/hints)
      LessonContext.tsx       supplies lessonId to <CodeExercise/> for snapshot keys
      LessonLayout.tsx        header (title/badges) wrapping the lesson body
  content/                Content types + GraphQL-backed data fetching
    lessons/<nn-slug>.mdx   legacy authoring source, see Content model below
    schema.ts               LessonFrontmatter, Circuit/Gate, QuizChoice, etc
                             (still the prop-shape types content_block.data
                             conforms to; unrelated to fetching now)
    index.ts                 getTracks/getAllLessons/getLesson/getNextLesson:
                             async, fetch apps/api's GraphQL endpoint; see
                             Content model below. No caching (see Stack: SSR)
  lib/
    graphqlClient.ts         plain fetch-based GraphQL POST, used by loaders
                             (content/index.ts) and build-time scripts alike
    apolloClient.ts           createApolloClient(): for future client-initiated
                             hooks/mutations (wired via ApolloProvider in
                             root.tsx) — NOT used for page data; loaders/
                             graphqlClient.ts own that
  db/                     Dexie database, zod models, repository helpers
                           (still the only progress/code-snapshot store)
  features/
    quantum/                Complex numbers, gate matrices, statevector simulate,
                             Bloch vector, sampleShots (client-side shot sampling)
    python/                  py-ast circuit extraction + comparison against expected circuits
  store/                  zustand stores (progress), statusColor
  theme/                  Chakra `createSystem` theme (tokens, semantic tokens)
```

## Content model (how a lesson is built)

**Two-stage pipeline, since the GraphQL cutover:** author a lesson as a
`.mdx` file (as described in this whole section, unchanged), then run
`pnpm --filter @qislearn/db migrate:mdx` (`packages/db/scripts/migrate-mdx.ts`)
to parse every `.mdx` file under `src/content/lessons/` and load it into
Postgres (`track`/`lesson`/`lesson_prerequisite`/`content_block` tables,
truncated and fully re-inserted each run — it's a one-shot batch load, not
an incremental sync). `apps/web` reads from Postgres via `apps/api`'s
GraphQL API at request time (`content/index.ts`); it never reads `.mdx`
files itself. **So: editing a `.mdx` file has no visible effect until you
re-run the migration script.** This is the authoring format, not the
runtime format — everything below about frontmatter, tags, LaTeX
conventions, and stable ids describes the `.mdx` source, which is exactly
what the migration script expects and what a learner will eventually see
once it's re-migrated.

Each lesson is a single `.mdx` file under `src/content/lessons/`. A YAML
frontmatter block gives its metadata (validated against `LessonFrontmatterSchema`
in `src/content/schema.ts`): `id`, `track`, `order`, `title`, `summary`, `layout`
(`standard | theory-heavy | circuit-focus | lab`: changes the container
width/framing in `LessonLayout.tsx`), `estimatedMinutes`, `prerequisites`. The body
below the frontmatter is free-form MDX: normal Markdown prose (LaTeX via `$...$` /
`$$...$$`, fenced ` ```python ` blocks get real syntax highlighting via
`MarkdownCodeBlock`), interspersed with custom tags — four generic ones used
across many lessons, plus one-off bespoke widgets particular lessons bring in
(`OracleFigure`, `ComplexPlaneExplorer`, `TensorProductBuilder`,
`GroverRotationPlayground`, `QFTPhaseWheel`, `PhaseEstimationPlayground`,
`ModularExponentiationExplorer` — see `mdxComponents.ts` for the full list).
Each becomes its own `content_block` row after migration, `type` set to the
tag's exact name (`"markdown"` for plain prose between tags). The four
generic ones:

- `<CodeExercise id="..." prompt="..." starterCode={\`...\`} expectedCircuit={{...}}
  hints={[...]} />`: starter code, optional `expectedCircuit` checked via
  `extractCircuit` + `compareCircuits`. `id` must be unique within the lesson (it's
  part of the Dexie code-snapshot key, alongside the lessonId read from
  `LessonContext`); the learner's code is persisted (debounced) as they type and
  restored on revisit.
- `<Visualization title="..." circuit={{...}} views={["circuit","bloch",...]} />`:
  a fixed `Circuit` rendered as circuit diagram + gate-by-gate `GateTimeline`
  scrubber + any of `bloch | statevector | probabilities` panels.
- `<Quiz id="..." question="..." choices={[{id,text,correct},...]}
  explanation="..." />`: multiple choice with an explanation. Like
  `CodeExercise`, `id` must be unique within the lesson; it's part of the Dexie
  answer key (`db.answers`, `lessonId::quizId`). The selected choice is saved as
  soon as it's picked (before "Submit"), and whether it was submitted; both restore
  on revisit.
- `<Measurement title="..." circuit={{...}} shotsOptions={[10,100,1000,10000]} />`:
  no persisted state (there's nothing to grade or restore). Simulates
  `AerSimulator`-style sampling client-side: computes the circuit's exact final
  probabilities once via `simulateCircuit`, then `features/quantum/sampleShots.ts`
  draws `shots` random outcomes from that distribution on demand ("Run again"
  re-samples). Shown side-by-side with the exact `ProbabilityBars` panel so a
  learner can see measured counts converge as shots increase; this is the
  "shots" teaching tool; it does not run real Aer (there is no Python here).

**Content authoring: LaTeX and gate names.** These apply to every prose string
authored for a lesson: MDX body text, and the `question`/`choices[].text`/
`explanation` props on `<Quiz>`, and the `prompt`/`hints` props on
`<CodeExercise>`, since all of them render through `remark-math`/`rehype-katex`
(directly for the MDX body, via the `Markdown` component for the prop strings).
It does **not** apply inside code: `starterCode`, any ` ```python ` fenced block,
or other CodeMirror/editor content stays plain Python source, since KaTeX isn't
rendered there and Python doesn't use LaTeX syntax anyway.

- **Gate names use LaTeX subscript notation, not a bare trailing letter.** Write
  an oracle gate as `$U_a$` / `$U_f$` (renders as $U_a$/$U_f$), not `Ua`/`Uf`.
  This matches how the same gate is written in the textbooks/papers a learner
  would cross-reference, and reads unambiguously next to other subscripted math
  (`$q_0$`, `$|\psi\rangle$`) instead of looking like a typo'd variable name.
- **Wrap gate names in LaTeX (`$...$`) wherever they appear in prose**, quiz
  questions/choices/explanations, and exercise prompts/hints, for consistency
  with the math surrounding them: `$H$`, `$X$`, `$CNOT$`, `$U_f$`, not bare
  `H`, `X`, `CNOT`, `Uf`. The one exception is inside code (see above): write
  `qc.h(0)` in a code block or `starterCode` as plain Python, never
  `qc.$H$(0)`.
- **`<Quiz>` question/choice/explanation text should use LaTeX wherever it
  states a gate, state, amplitude, or other math expression**, the same as MDX
  body prose does, e.g. a choice reading "applies $X$ to $q_1$" rather than
  "applies X to q1". Plain English framing around the math (the actual
  question being asked) doesn't need LaTeX, only the notation itself.
- **`choices[].text` must be written as `` String.raw`...` ``, not a plain
  `"..."` string.** `question`/`explanation` are JSX attribute strings, so a
  backslash there is passed through literally (`question="$U_a$"` needs no
  escaping). `choices` is a JS array literal inside `{...}`, so a plain
  double-quoted `text: "..."` would have its backslashes parsed as JS escape
  sequences (`\r`, `\t`, etc.), silently mangling LaTeX like `\rangle` or
  `\text`. `String.raw` suppresses that, so `text` can use the exact same
  unescaped LaTeX syntax as `question`/`explanation`:
  `` text: String.raw`$|00\rangle$, unchanged.` ``, not
  `text: "$|00\\rangle$, unchanged."`. (Choice text can't contain a backtick
  or `` ${ ``, since those terminate/interpolate a template literal, but
  quiz choices never need either.)

`Circuit` (`content/schema.ts`) also carries optional `name` and `qubitLabels`,
which `CircuitDiagram` renders as a caption and per-wire labels respectively;
this is what makes `QuantumCircuit(..., name="...")` and a named `QuantumRegister`
visibly "do something" for a learner, not just be inert syntax. When authoring a
`Visualization`, set these directly in the `circuit` prop if you want the diagram
to demonstrate naming (see `03-entanglement.mdx`'s Bell-state visualization). When
a learner types the equivalent Python in a `CodeExercise`, `extractCircuit` derives
both automatically; grading (`compareCircuits`) ignores both, though, since it
only compares qubit count and gates.

Both `CodeExercise` and `Quiz` require an explicit `id` prop rather than deriving
one from render position (e.g. `useId()`); a position-derived id can silently
shift if the surrounding MDX content is edited, which would orphan a learner's
saved answer/code under a stale key. Pick a stable, lesson-unique slug and don't
rename it once a lesson has shipped.

Lessons render **continuously** (no per-step pager): `LessonPage`'s `loader`
fetches the lesson's full `content_block` list in one GraphQL request, and
`ContentBlockList` renders it all at once (`mdxComponents.ts` supplying the
tag components, `Markdown` the markdown blocks). Progress is per-lesson, not
per-step: visiting a lesson marks it `in-progress`; an `IntersectionObserver`
on a sentinel at the end of the content marks it `completed` once the
learner scrolls there (see `store/progressStore.ts`; `setStatus` also
refuses to downgrade a `completed` lesson back to `in-progress`).

To add a lesson: create `src/content/lessons/<order-slug>.mdx` with frontmatter
(unique `id`, `order`, `prerequisites` naming other lessons' `id`s if applicable),
write the body, then run `pnpm --filter @qislearn/db migrate:mdx` to load it
(and every other lesson) into Postgres — nothing picks it up automatically
otherwise. The migration script fails loudly on invalid frontmatter or an
unresolvable `prerequisites` slug, but does **not** schema-validate each
tag's props the way `LessonFrontmatterSchema` validates frontmatter (it
evaluates whatever JS expression each JSX attribute contains and stores it
as-is in `content_block.data`); a malformed `<CodeExercise .../>` prop shape
only surfaces at render time in `apps/web`, not at migration time.

**`id` vs. `order`, and why neither is a sequential integer suffix**: `id` is a
stable, purely descriptive slug (e.g. `algorithms-oracles`, not
`algorithms-08-oracles`). It's the Dexie key for saved code snapshots and quiz
answers (`lessonId::exerciseId` / `lessonId::quizId`) and the target of other
lessons' `prerequisites` arrays, so it must never be renumbered once a lesson has
shipped, for the same reason `CodeExercise`/`Quiz` ids must stay stable (see
above). `order` is the only field that encodes position, is a plain `number`
compared **globally across all tracks** (`content/index.ts`'s `getAllLessons`
sorts the full lesson list by `order`, and `getNextLesson` walks that same flat
list for the lesson-to-lesson "next" link, so `order` values must be globally
distinct and monotonic across tracks, not just unique within one track), and uses
steps of 100 (100, 200, 300, ...) precisely so a lesson can be inserted later
without renumbering its neighbors: pick the midpoint (150 between 100 and 200),
and if that gap fills too, bisect again (125 or 175). The `.mdx` filename mirrors
`order` as a prefix purely for directory browsability (`1100-multi-qubit-
superposition.mdx`); unlike `id`, nothing in code reads the filename, so renaming
one when inserting a lesson is just a `git mv`, not a data-migration concern.

**How the migration script parses a `.mdx` file** (`packages/db/scripts/migrate-mdx.ts`):
frontmatter via a `remark-frontmatter`-augmented `unified`/`remark-parse`
pipeline (matching `apps/web/vite.config.ts`'s old plugin set, so parsing
stays consistent with what the source was originally authored/previewed
against), walking the resulting mdast tree's top-level nodes in order —
consecutive non-JSX nodes get merged into one `markdown` block (original
source text preserved byte-for-byte via each node's position offsets), each
top-level JSX tag becomes its own block. JSX expression attributes
(`circuit={{...}}`) are evaluated via `new Function(...)`, safe only because
lesson `.mdx` files are repo-controlled content, not user input; don't reuse
that evaluation approach anywhere that touches untrusted strings.

## Qiskit conventions: read this before touching simulation or diagram code

Qiskit uses **little-endian qubit ordering**, and this codebase follows it exactly
so that circuits and state vectors match what learners see in real Qiskit output:

- A qubit `q_i` occupies **bit position `i`** in the statevector index (so `q0` is
  the least-significant bit). Basis kets are written
  `|q_{n-1} ... q_2 q_1 q_0>`, e.g. for 2 qubits, index `0b10` = `|q1=1, q0=0>` is
  printed as `"10"`.
- In `src/features/quantum/simulate.ts`, gate application uses
  `mask = 1 << qubit` directly (not `numQubits - 1 - qubit`); do not "fix" this,
  it's intentional and matches Qiskit, not textbook big-endian tensor order.
- `basisLabels()` relies on the fact that `i.toString(2).padStart(numQubits, "0")`
  already reads MSB-first left-to-right, which is exactly the
  `|q_{n-1}...q_0>` convention; no bit-reversal needed there.
- In circuit diagrams (`CircuitDiagram.tsx`), qubits are drawn **top-to-bottom
  starting at `q0`**, gates left-to-right in time order, matching Qiskit's
  `QuantumCircuit.draw()`. Classical registers/measurement wires are not modeled yet
  (see Known limitations).

If you add gates, simulation features, or diagram elements, cross-check against real
Qiskit behavior for that gate/feature, not generic textbook convention.

## Conventions

- **Validation**: use `zod` for anything crossing a boundary: lesson JSON, IndexedDB
  records. Don't write manual `if` chains for shape-checking.
- **No inline/change-tracking comments.** Comments are reserved for genuinely
  non-obvious invariants (e.g. the little-endian note above). Don't describe what a
  line does or annotate what changed.
- **No backwards-compatibility shims.** This is a from-scratch scaffold; if
  something's unused, delete it rather than deprecating it.
- **No em dashes (`—`), en dashes (`–`), or spaced hyphens ( - ) as prose
  punctuation** in this file or in *any* authored lesson content: MDX body
  text, `<Quiz>` `question`/`choices[].text`/`explanation`, and
  `<CodeExercise>` `prompt`/`hints`. They read as minus signs next to quantum
  math (negative amplitudes, `|−⟩` states, etc.). Use a comma, colon,
  semicolon, parentheses, or a new sentence instead. This is not just a style
  preference for freshly-written prose: before marking any new or edited
  lesson done, grep the touched `.mdx` file for `—`, `–`, and ` - ` (a
  hyphen with spaces on both sides, not a hyphenated word or a `-` inside
  code) and rewrite any hit. A plain, unhyphenated `-` still reads fine
  inside identifiers or Python code, this rule is about prose punctuation
  only.
- **Dexie schema changes go in a new `.version(n)` block** (`src/db/db.ts`), not by
  editing the existing version's `.stores()` in place. Dexie only re-runs the
  upgrade/schema step when the version number increases; editing an existing
  version silently no-ops for anyone with an already-created IndexedDB database
  (i.e., yourself, mid-development, in whatever browser you've been testing in).
  Tables you don't mention in a new version carry over unchanged; you only need
  to list what's new/changed.
- **Chakra v3 API**: components are compound/namespaced (`Alert.Root`,
  `Alert.Indicator`, `Slider.Root`, `RadioCard.Root`, `Accordion.Root`, ...), not the
  flat `<Alert status="success">` API from Chakra v2. Check
  `node_modules/@chakra-ui/react/dist/types/components/<name>/namespace.d.ts` when
  unsure of a component's shape rather than guessing from v2 memory.
- **Heavy viz/editor libraries are lazy-loaded, and gated client-side-only under SSR.**
  `three`/`@react-three/*`, `plotly.js`/`react-plotly.js`, and CodeMirror are large;
  they're pulled in via `React.lazy` + `Suspense` at their point of use (see
  `mdx/Visualization.tsx` for Bloch/Plotly, `mdx/CodeExercise.tsx` for PyEditor) and
  split into separate chunks (`vite.config.ts` `manualChunks`). Since `ssr: true`,
  each of those `Suspense` boundaries is additionally wrapped in
  `<ClientOnly fallback={<Skeleton .../>}>` (`src/components/ClientOnly.tsx`): none
  of the three libraries resolve correctly under Node's SSR render (plotly.js's ESM
  build does an extensionless import Node's loader rejects; three.js/CodeMirror
  assume browser globals), so `ClientOnly` defers rendering them until after the
  first client-side effect, matching the server-rendered fallback exactly (no
  hydration mismatch). Follow this pattern for any new heavy/browser-only widget:
  `Suspense` alone is not enough once SSR is on, wrap it in `ClientOnly` too.
  `mdxComponents.ts` itself is imported eagerly by every lesson page, so it must
  only ever hold lightweight component *definitions*; keep new heavy deps behind a
  local `React.lazy` inside the component that needs them, not at that module's
  top level.

## Commands

Needs the backend reachable first (`docker compose up -d postgres openfga`
from the repo root, plus `apps/api` running — see the repo root `README.md`
for the one-command `docker compose up -d` full-stack option). Run from
`apps/web/` directly, or from the repo root via
`pnpm --filter @qislearn/web <script>`:

```
npm run dev       # react-router dev (Vite dev server, SSR)
npm run build     # tsc -b && react-router build -> build/client + build/server
npm run start     # react-router-serve ./build/server/index.js (run the production build)
npm run lint       # oxlint
```

`pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm typecheck` from the repo root
run the same scripts across every app/package via Turborepo (`apps/web`,
`apps/api`, `packages/db`, `packages/graphql-schema`, `packages/authz`;
`apps/llm-service` is still a trivial stub).

## Verifying changes

- `tsc -b`, `npm run build`, and `npm run lint` (oxlint), run from `apps/web/`,
  are the baseline checks; run them after any non-trivial change. `npm run
  build` needs `apps/api`/Postgres reachable now (it's an SSR build, not a
  static prerender) — a build failure with a GraphQL-shaped stack trace
  usually means the backend isn't up, not a real bug.
- Don't verify in a real browser (chromium-cli, Playwright, or similar) unless the
  user explicitly asks for it. It's fine to start the dev/production server
  yourself purely to `curl` routes and confirm they respond without error
  (e.g. check a lesson page's HTTP status and rendered `<title>`); that's not
  the same as browser verification and doesn't need permission.
- If you start a dev/production server or `docker compose up` yourself, stop
  only what you started (the exact PID, or `docker compose stop <service>`
  for just the services you brought up). Never pattern-kill (`pkill -f vite`,
  etc.) or `docker compose down` the whole stack; another session or the user
  may already have something running (they may be watching it live), and a
  broad kill/down has no way to distinguish "mine" from "theirs."

## Known limitations / natural next steps

- **No real Python execution.** `py-ast` gives static analysis only: a flat,
  single-pass read of top-level statements (see the "Python analysis" bullet
  above for exactly what it does and doesn't catch). It doesn't handle loops,
  conditionals, functions, or custom gate classes it doesn't recognize by name.
  If real execution becomes a requirement, that's a Pyodide/WASM integration: a
  materially different feature, not an extension of `extractCircuit`.
- **Classical bits are tracked per-gate, not as a full register model.**
  `GateSchema.clbits` records which classical bit(s) a `measure` gate writes to
  (from `.measure(qubit, clbit)`'s explicit second argument, or the sequential
  assignment `measure_all()`/`measure_active()` give their new register).
  `CircuitDiagram` draws a single classical double-line wire (labeled `c`,
  not enumerated per-bit) whenever any `measure` gate is present, with a
  straight 90° connector from the gate down to it and the target clbit number
  written at the landing point. There's still no `ClassicalRegister` object
  model (multiple registers collapse into that one wire) and no mid-circuit
  measurement semantics; `Circuit` doesn't track register boundaries, only
  per-gate clbit targets.
- **`plotly.js` is a large dependency** (~4.6MB pre-gzip in its own chunk). It's
  lazy-loaded so it doesn't block initial page load, but if bundle size becomes a
  concern, swapping to a lighter charting approach (custom SVG bars, or
  `plotly.js-dist-min` restricted to bar traces) is a reasonable follow-up; the only
  consumer is `StateVectorChart.tsx`.
- **Simulator gate set is intentionally minimal**: `x y z h s t id rx ry rz cx cz
  swap`. Add to `SINGLE_QUBIT_GATES` / the two-qubit-gate branch in
  `applyGate` (`src/features/quantum/`) as lessons need more (e.g. Toffoli, `u`
  gates).
- **No sub-lesson progress.** Continuous-scroll means progress is tracked per
  lesson (not-started/in-progress/completed) via scroll-to-bottom, not per step or
  per exercise. A learner who scrolls past a `<CodeExercise/>` without solving it
  still gets the lesson marked complete; this is intentional (reading vs. doing is
  the learner's call), not a bug to "fix" by gating completion on exercise checks.
