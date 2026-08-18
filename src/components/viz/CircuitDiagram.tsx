import { Box, HStack, Text, useToken } from "@chakra-ui/react";
import { forwardRef, useId } from "react";
import type { Circuit } from "../../content/schema";
import { getControlGateStyle, getGateStyle } from "./gateStyles";
import { customLabelLatex, getGateLatex, qubitLatex } from "./gateLatexLabels";
import { SvgKatexLabel, useVizLatex } from "./latexLabels";
import { defaultQubitLabel } from "./qubitLabel";

export interface CircuitDiagramProps {
  circuit: Circuit;
  activeGateIndex?: number;
  showLegend?: boolean;
}

const COLUMN_WIDTH = 72;
const ROW_HEIGHT = 64;
const MIN_LEFT_MARGIN = 40;
const LABEL_CHAR_WIDTH = 7.8;
const LABEL_PADDING = 16;
const TOP_MARGIN = 28;
const GATE_SIZE = 40;
const CLASSICAL_GAP = 56;
const CLASSICAL_ROW_HEIGHT = 34;
const CLASSICAL_LINE_OFFSET = 1.5;

interface ClassicalWire {
  name: string;
  size: number;
  /** This register's first bit, as a flat index across all registers concatenated (Qiskit's global clbit numbering). */
  offset: number;
  y: number;
}

const TWO_QUBIT_GATES = new Set(["cx", "cnot", "cz", "cp", "cu1", "swap"]);
const MONO_FONT = "'Fira Code', ui-monospace, monospace";

/**
 * Assigns each gate a column: the earliest position available on every qubit
 * line it touches, matching how Qiskit's own `.draw()` packs gates — e.g.
 * `qc.h([0, 1, 2])` (three independent single-qubit `Gate`s) lands all three
 * in the same column since none of them has been blocked by a prior gate on
 * its line. A `barrier` occupies a column on every qubit line it spans (all
 * lines, for the empty-`qubits` "barrier everything" form) and advances all
 * of those lines past it, so later gates on a barred qubit are pushed after it.
 * A multi-qubit gate's connector is drawn spanning every qubit line between
 * its min and max qubit, not just the ones it targets, so it blocks (and
 * advances) every line in that range too; otherwise a later gate on an
 * in-between qubit could land in the same column and overlap the connector.
 */
function layoutColumns(circuit: Circuit): { columns: number; columnOf: number[] } {
  const nextAvailable = new Array<number>(circuit.numQubits).fill(0);
  const columnOf: number[] = [];
  let maxColumn = -1;

  for (const gate of circuit.gates) {
    const isBarrier = gate.gate.toLowerCase() === "barrier";
    const qubits =
      isBarrier && gate.qubits.length === 0
        ? Array.from({ length: circuit.numQubits }, (_, i) => i)
        : gate.qubits;

    const spannedQubits =
      qubits.length >= 2
        ? Array.from(
            { length: Math.max(...qubits) - Math.min(...qubits) + 1 },
            (_, i) => Math.min(...qubits) + i,
          )
        : qubits;

    const column = spannedQubits.length === 0 ? 0 : Math.max(...spannedQubits.map((q) => nextAvailable[q] ?? 0));
    for (const q of spannedQubits) nextAvailable[q] = column + 1;

    columnOf.push(column);
    maxColumn = Math.max(maxColumn, column);
  }

  return { columns: maxColumn + 1, columnOf };
}

const BARRIER_WIDTH = 9;

/**
 * A dot-patterned, borderless block marking a barrier over one contiguous
 * run of qubit lines (`fromY`/`toY` are the row centers of the run's first
 * and last qubit). Drawn as a single rect spanning the *full* row height of
 * every qubit in the run (not inset), so two barrier gates stacked top-to-
 * bottom on adjacent qubits butt up against each other with no gap and read
 * as one continuous block, matching Qiskit's own `.draw()`. Fill is a dot
 * pattern (see `BarrierDotPattern`) rather than a solid color or an outlined
 * shape, so it reads as a distinct texture instead of another bordered box
 * next to the gate fills.
 */
function BarrierBlock({
  x,
  fromY,
  toY,
  patternId,
}: {
  x: number;
  fromY: number;
  toY: number;
  patternId: string;
}) {
  return (
    <rect
      x={x - BARRIER_WIDTH / 2}
      y={fromY - ROW_HEIGHT / 2}
      width={BARRIER_WIDTH}
      height={toY - fromY + ROW_HEIGHT}
      fill={`url(#${patternId})`}
    />
  );
}

/** Dot `<pattern>` def used as the barrier block's fill; keep tile size small relative to `BARRIER_WIDTH`. */
function BarrierDotPattern({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} width={2.25} height={2.25} patternUnits="userSpaceOnUse">
      <circle cx={1.125} cy={1.125} r={0.45} fill={color} fillOpacity={0.8} />
    </pattern>
  );
}

/** Splits a sorted qubit index list into runs of consecutive integers, e.g. `[0, 1, 2, 4]` -> `[[0, 1, 2], [4]]`. */
function contiguousRuns(qubits: number[]): number[][] {
  const sorted = [...qubits].sort((a, b) => a - b);
  const runs: number[][] = [];
  for (const q of sorted) {
    const last = runs.at(-1);
    if (last && q === last.at(-1)! + 1) {
      last.push(q);
    } else {
      runs.push([q]);
    }
  }
  return runs;
}

/** The standard meter-with-needle glyph used for measurement in circuit diagrams. */
function MeasureGlyph({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path
        d={`M ${x - 9} ${y + 6} A 9 9 0 0 1 ${x + 9} ${y + 6}`}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <line x1={x} y1={y + 6} x2={x + 7} y2={y - 8} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={x} cy={y + 6} r={1.6} fill={color} />
    </g>
  );
}

/** Diagonal tick crossing a classical wire's double line, with the register's bit-width number beside it. */
function ClassicalRegisterCut({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <g>
      <line x1={x - 4} y1={y + 7} x2={x + 4} y2={y - 7} stroke={color} strokeWidth={1.5} />
      <text x={x + 6} y={y - 6} fontSize={10} fill={color} fontFamily={MONO_FONT} fontWeight={600}>
        {size}
      </text>
    </g>
  );
}

/** Straight double line from a measure gate down to the classical wire, arrowhead at the landing point. */
function MeasureConnector({ x, fromY, toY, color }: { x: number; fromY: number; toY: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={1.5} fill="none">
      <line x1={x - 2} y1={fromY} x2={x - 2} y2={toY - CLASSICAL_LINE_OFFSET - 8} />
      <line x1={x + 2} y1={fromY} x2={x + 2} y2={toY - CLASSICAL_LINE_OFFSET - 8} />
      <path
        d={`M ${x - 5} ${toY - 9} L ${x} ${toY - 1} L ${x + 5} ${toY - 9}`}
        fill={color}
        stroke="none"
      />
    </g>
  );
}

export const CircuitDiagram = forwardRef<SVGSVGElement, CircuitDiagramProps>(function CircuitDiagram(
  { circuit, activeGateIndex, showLegend = true },
  ref,
) {
  const [wireColor, activeRing, textColor] = useToken("colors", ["border", "quantum.400", "fg"]);
  const latex = useVizLatex();
  const barrierPatternId = `barrier-hatch-${useId().replace(/:/g, "")}`;

  const { columns, columnOf } = layoutColumns(circuit);
  const measureGates = circuit.gates.filter((g) => g.gate.toLowerCase() === "measure");

  /**
   * Barrier qubits are merged per column (not per gate) before splitting into
   * contiguous runs, so two separate `.barrier()` calls that land in the same
   * column on adjacent qubits (e.g. `qc.barrier(0)` then `qc.barrier(1)`)
   * render as one seamless block instead of two rects with visible seams
   * where their rounded corners meet.
   */
  const barrierQubitsByColumn = new Map<number, Set<number>>();
  circuit.gates.forEach((gate, index) => {
    if (gate.gate.toLowerCase() !== "barrier") return;
    const qubits = gate.qubits.length === 0 ? Array.from({ length: circuit.numQubits }, (_, i) => i) : gate.qubits;
    const column = columnOf[index];
    const set = barrierQubitsByColumn.get(column) ?? new Set<number>();
    for (const q of qubits) set.add(q);
    barrierQubitsByColumn.set(column, set);
  });
  const barrierBlocks = Array.from(barrierQubitsByColumn.entries()).flatMap(([column, qubitSet]) =>
    contiguousRuns(Array.from(qubitSet)).map((run) => ({ column, run })),
  );

  const qubitY = (q: number) => TOP_MARGIN + q * ROW_HEIGHT + GATE_SIZE / 2;

  const qubitLabels = Array.from({ length: circuit.numQubits }, (_, q) =>
    circuit.qubitLabels?.[q] ?? defaultQubitLabel(q, circuit.numQubits),
  );

  /**
   * One wire per classical register. If the circuit declares explicit
   * `classicalRegisters` (from named `ClassicalRegister`s passed into
   * `QuantumCircuit(...)`), draw one per register in that order, each keeping
   * its own name and bit-width. Otherwise — e.g. plain `QuantumCircuit(n, m)`
   * — fall back to a single unnamed "c" wire sized to whatever the highest
   * measured clbit requires.
   */
  const registers: ClassicalWire[] = (() => {
    if (circuit.classicalRegisters && circuit.classicalRegisters.length > 0) {
      let offset = 0;
      return circuit.classicalRegisters.map((reg) => {
        const wire: ClassicalWire = { name: reg.name, size: reg.size, offset, y: 0 };
        offset += reg.size;
        return wire;
      });
    }
    if (measureGates.length === 0) return [];
    const maxClbit = Math.max(-1, ...measureGates.map((g) => Math.max(...(g.clbits ?? g.qubits))));
    return [{ name: "c", size: maxClbit + 1, offset: 0, y: 0 }];
  })();
  registers.forEach((r, i) => {
    r.y = qubitY(circuit.numQubits - 1) + CLASSICAL_GAP + i * CLASSICAL_ROW_HEIGHT;
  });

  function registerFor(clbit: number): ClassicalWire | undefined {
    return registers.find((r) => clbit >= r.offset && clbit < r.offset + r.size) ?? registers[0];
  }

  const maxLabelChars = Math.max(
    0,
    ...qubitLabels.map((label) => label.length),
    ...registers.map((r) => r.name.length),
  );
  const leftMargin = Math.max(MIN_LEFT_MARGIN, LABEL_PADDING + maxLabelChars * LABEL_CHAR_WIDTH);
  const width = leftMargin + (columns + 1) * COLUMN_WIDTH;

  const height =
    TOP_MARGIN * 2 +
    (circuit.numQubits - 1) * ROW_HEIGHT +
    GATE_SIZE +
    (registers.length > 0 ? CLASSICAL_GAP + (registers.length - 1) * CLASSICAL_ROW_HEIGHT + 20 : 0);

  const usedGates = Array.from(
    new Set(circuit.gates.map((g) => g.gate.toLowerCase()).filter((name) => name !== "barrier")),
  );

  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" p="5" bg="bg.panel">
      {circuit.name && (
        <Text fontSize="xs" color="fg.muted" fontFamily="mono" mb="3">
          circuit:{" "}
          <Text as="span" color="colorPalette.fg" fontWeight="semibold">
            {circuit.name}
          </Text>
        </Text>
      )}
      <Box overflowX="auto">
        <svg ref={ref} width={width} height={Math.max(height, 80)} role="img" aria-label="Quantum circuit diagram">
          <defs>
            <BarrierDotPattern id={barrierPatternId} color={textColor} />
          </defs>
          {Array.from({ length: circuit.numQubits }, (_, q) => {
            const plainLabel = circuit.qubitLabels?.[q] ?? defaultQubitLabel(q, circuit.numQubits);
            return (
              <g key={`wire-${q}`}>
                <line
                  x1={leftMargin}
                  y1={qubitY(q)}
                  x2={width - COLUMN_WIDTH / 2}
                  y2={qubitY(q)}
                  stroke={wireColor}
                  strokeWidth={1.5}
                />
                {latex ? (
                  <SvgKatexLabel
                    x={0}
                    y={qubitY(q)}
                    width={leftMargin - 6}
                    height={20}
                    align="start"
                    tex={circuit.qubitLabels?.[q] ? customLabelLatex(circuit.qubitLabels[q]) : qubitLatex(q, circuit.numQubits)}
                    color={textColor}
                    fontSizePx={13}
                  />
                ) : (
                  <text x={0} y={qubitY(q) + 5} fontSize={13} fill={textColor} fontFamily={MONO_FONT} fontWeight={600}>
                    {plainLabel}
                  </text>
                )}
              </g>
            );
          })}

          {registers.map((reg, i) => (
            <g key={`creg-${i}`}>
              <line
                x1={leftMargin}
                y1={reg.y - CLASSICAL_LINE_OFFSET}
                x2={width - COLUMN_WIDTH / 2}
                y2={reg.y - CLASSICAL_LINE_OFFSET}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              <line
                x1={leftMargin}
                y1={reg.y + CLASSICAL_LINE_OFFSET}
                x2={width - COLUMN_WIDTH / 2}
                y2={reg.y + CLASSICAL_LINE_OFFSET}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              <ClassicalRegisterCut x={leftMargin + 14} y={reg.y} size={reg.size} color={textColor} />
              {latex ? (
                <SvgKatexLabel
                  x={0}
                  y={reg.y}
                  width={leftMargin - 6}
                  height={20}
                  align="start"
                  tex={customLabelLatex(reg.name)}
                  color={textColor}
                  fontSizePx={13}
                />
              ) : (
                <text x={0} y={reg.y + 5} fontSize={13} fill={textColor} fontFamily={MONO_FONT} fontWeight={600}>
                  {reg.name}
                </text>
              )}
            </g>
          ))}

          {barrierBlocks.map(({ column, run }) => (
            <BarrierBlock
              key={`barrier-${column}-${run[0]}`}
              x={leftMargin + (column + 0.75) * COLUMN_WIDTH}
              fromY={qubitY(run[0])}
              toY={qubitY(run.at(-1)!)}
              patternId={barrierPatternId}
            />
          ))}

          {circuit.gates.map((gate, index) => {
            const x = leftMargin + (columnOf[index] + 0.75) * COLUMN_WIDTH;
            const isActive = activeGateIndex === index;
            const name = gate.gate.toLowerCase();

            if (name === "barrier") return null;

            if (TWO_QUBIT_GATES.has(name) && gate.qubits.length >= 2) {
              const [q0, q1] = gate.qubits;
              const y0 = qubitY(q0);
              const y1 = qubitY(q1);
              const isControlGate = name === "cx" || name === "cnot" || name === "cz" || name === "cp" || name === "cu1";
              const style = getControlGateStyle(name);

              return (
                <g key={`gate-${index}`}>
                  {isActive && (
                    <line x1={x} y1={y0} x2={x} y2={y1} stroke={activeRing} strokeWidth={6} opacity={0.35} />
                  )}
                  <line x1={x} y1={y0} x2={x} y2={y1} stroke={style.fill} strokeWidth={2} />
                  {isControlGate ? (
                    <>
                      <circle cx={x} cy={y0} r={6} fill={style.fill} />
                      {name === "cx" || name === "cnot" ? (
                        <g>
                          <circle cx={x} cy={y1} r={15} fill="none" stroke={style.fill} strokeWidth={2.5} />
                          <line x1={x - 10} y1={y1} x2={x + 10} y2={y1} stroke={style.fill} strokeWidth={2.5} />
                          <line x1={x} y1={y1 - 10} x2={x} y2={y1 + 10} stroke={style.fill} strokeWidth={2.5} />
                        </g>
                      ) : (
                        <circle cx={x} cy={y1} r={6} fill={style.fill} />
                      )}
                    </>
                  ) : (
                    <>
                      <g stroke={style.fill} strokeWidth={2.5}>
                        <line x1={x - 9} y1={y0 - 9} x2={x + 9} y2={y0 + 9} />
                        <line x1={x - 9} y1={y0 + 9} x2={x + 9} y2={y0 - 9} />
                        <line x1={x - 9} y1={y1 - 9} x2={x + 9} y2={y1 + 9} />
                        <line x1={x - 9} y1={y1 + 9} x2={x + 9} y2={y1 - 9} />
                      </g>
                    </>
                  )}
                </g>
              );
            }

            const q = gate.qubits[0] ?? 0;
            const y = qubitY(q);
            const style = getGateStyle(name);
            return (
              <g key={`gate-${index}`}>
                {isActive && (
                  <rect
                    x={x - GATE_SIZE / 2 - 4}
                    y={y - GATE_SIZE / 2 - 4}
                    width={GATE_SIZE + 8}
                    height={GATE_SIZE + 8}
                    fill="none"
                    stroke={activeRing}
                    strokeWidth={2.5}
                  />
                )}
                <rect
                  x={x - GATE_SIZE / 2}
                  y={y - GATE_SIZE / 2}
                  width={GATE_SIZE}
                  height={GATE_SIZE}
                  fill={style.fill}
                />
                {name === "measure" ? (
                  (() => {
                    const clbit = gate.clbits?.[0] ?? q;
                    const reg = registerFor(clbit);
                    const localBit = reg ? clbit - reg.offset : clbit;
                    return (
                      <>
                        <MeasureGlyph x={x} y={y} color={style.textColor} />
                        <MeasureConnector
                          x={x}
                          fromY={y + GATE_SIZE / 2}
                          toY={reg?.y ?? y + GATE_SIZE / 2}
                          color={textColor}
                        />
                        <text
                          x={x}
                          y={(reg?.y ?? y) + 16}
                          fontSize={10}
                          textAnchor="middle"
                          fill={textColor}
                          fontFamily={MONO_FONT}
                          fontWeight={600}
                        >
                          {localBit}
                        </text>
                      </>
                    );
                  })()
                ) : latex ? (
                  <SvgKatexLabel
                    x={x - GATE_SIZE / 2}
                    y={y}
                    width={GATE_SIZE}
                    height={GATE_SIZE}
                    align="center"
                    tex={getGateLatex(name, style.label)}
                    color={style.textColor}
                    fontSizePx={13}
                  />
                ) : (
                  <text
                    x={x}
                    y={y + 5}
                    fontSize={13}
                    fontWeight={700}
                    textAnchor="middle"
                    fill={style.textColor}
                    fontFamily={MONO_FONT}
                  >
                    {style.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </Box>

      {showLegend && usedGates.length > 0 && (
        <HStack mt="4" pt="3" borderTopWidth="1px" borderColor="border.muted" gap="4" wrap="wrap">
          {usedGates.map((name) => {
            const style = TWO_QUBIT_GATES.has(name) ? getControlGateStyle(name) : getGateStyle(name);
            return (
              <HStack key={name} gap="1.5">
                <Box w="2.5" h="2.5" bg={style.fill} flexShrink={0} />
                <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                  {name}
                </Text>
              </HStack>
            );
          })}
        </HStack>
      )}
    </Box>
  );
});
