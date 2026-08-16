# QisLearn

An interactive, entirely browser-based course for learning quantum computing with
[Qiskit](https://www.ibm.com/quantum/qiskit) — from "what is a qubit" up through
entanglement and beyond.

There's no backend and no server-side Python. Lessons ship as JSON content bundled
with the app; your progress and saved code live only in your browser's IndexedDB.
Code you write is checked statically (parsed, not executed) against what each
exercise expects.

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
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static production
bundle (`dist/`) that can be hosted anywhere — the app has no server dependency.

```bash
npm run build     # type-check + production build
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

## Tech stack

TypeScript 7 · React 19 · Vite · Chakra UI v3 · Dexie (IndexedDB) · CodeMirror 6 ·
`py-ast` (static Python parsing) · three.js / react-three-fiber (Bloch sphere) ·
Plotly (amplitude charts) · zustand · zod

## Project status

This is an early-stage scaffold: the app shell, content pipeline, quantum
simulator, and three example lessons (qubits, single-qubit gates, entanglement) are
in place and working end to end. It's meant to be built out lesson by lesson from
here — see [AGENTS.md](./AGENTS.md) for known limitations (no real Python
execution, no classical registers yet) and where to extend things.
