import { Box, HStack, Text, useToken } from "@chakra-ui/react";
import type { Circuit } from "../../content/schema";
import { getControlGateStyle, getGateStyle } from "./gateStyles";

export interface CircuitDiagramProps {
  circuit: Circuit;
  activeGateIndex?: number;
  showLegend?: boolean;
}

const COLUMN_WIDTH = 72;
const ROW_HEIGHT = 64;
const LEFT_MARGIN = 40;
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

const TWO_QUBIT_GATES = new Set(["cx", "cnot", "cz", "swap"]);
const MONO_FONT = "'Fira Code', ui-monospace, monospace";

/**
 * Assigns each gate a column: the earliest position available on every qubit
 * line it touches, matching how Qiskit's own `.draw()` packs gates — e.g.
 * `qc.h([0, 1, 2])` (three independent single-qubit `Gate`s) lands all three
 * in the same column since none of them has been blocked by a prior gate on
 * its line. A `barrier` occupies a column on every qubit line it spans (all
 * lines, for the empty-`qubits` "barrier everything" form) and advances all
 * of those lines past it, so later gates on a barred qubit are pushed after it.
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

    const column = qubits.length === 0 ? 0 : Math.max(...qubits.map((q) => nextAvailable[q] ?? 0));
    for (const q of qubits) nextAvailable[q] = column + 1;

    columnOf.push(column);
    maxColumn = Math.max(maxColumn, column);
  }

  return { columns: maxColumn + 1, columnOf };
}

/** Small vertical dashed tick marking a barrier on one qubit's wire. */
function BarrierTick({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <line
      x1={x}
      y1={y - ROW_HEIGHT / 2 + 4}
      x2={x}
      y2={y + ROW_HEIGHT / 2 - 4}
      stroke={color}
      strokeWidth={2}
      strokeDasharray="4 3"
    />
  );
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

export function CircuitDiagram({ circuit, activeGateIndex, showLegend = true }: CircuitDiagramProps) {
  const [wireColor, activeRing, textColor] = useToken("colors", ["border", "quantum.400", "fg"]);

  const { columns, columnOf } = layoutColumns(circuit);
  const width = LEFT_MARGIN + (columns + 1) * COLUMN_WIDTH;
  const measureGates = circuit.gates.filter((g) => g.gate.toLowerCase() === "measure");

  const qubitY = (q: number) => TOP_MARGIN + q * ROW_HEIGHT + GATE_SIZE / 2;

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
        <svg width={width} height={Math.max(height, 80)} role="img" aria-label="Quantum circuit diagram">
          {Array.from({ length: circuit.numQubits }, (_, q) => (
            <g key={`wire-${q}`}>
              <line
                x1={LEFT_MARGIN}
                y1={qubitY(q)}
                x2={width - COLUMN_WIDTH / 2}
                y2={qubitY(q)}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              <text x={0} y={qubitY(q) + 5} fontSize={13} fill={textColor} fontFamily={MONO_FONT} fontWeight={600}>
                {circuit.qubitLabels?.[q] ?? `q${q}`}
              </text>
            </g>
          ))}

          {registers.map((reg, i) => (
            <g key={`creg-${i}`}>
              <line
                x1={LEFT_MARGIN}
                y1={reg.y - CLASSICAL_LINE_OFFSET}
                x2={width - COLUMN_WIDTH / 2}
                y2={reg.y - CLASSICAL_LINE_OFFSET}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              <line
                x1={LEFT_MARGIN}
                y1={reg.y + CLASSICAL_LINE_OFFSET}
                x2={width - COLUMN_WIDTH / 2}
                y2={reg.y + CLASSICAL_LINE_OFFSET}
                stroke={wireColor}
                strokeWidth={1.5}
              />
              <ClassicalRegisterCut x={LEFT_MARGIN + 14} y={reg.y} size={reg.size} color={textColor} />
              <text x={0} y={reg.y + 5} fontSize={13} fill={textColor} fontFamily={MONO_FONT} fontWeight={600}>
                {reg.name}
              </text>
            </g>
          ))}

          {circuit.gates.map((gate, index) => {
            const x = LEFT_MARGIN + (columnOf[index] + 0.75) * COLUMN_WIDTH;
            const isActive = activeGateIndex === index;
            const name = gate.gate.toLowerCase();

            if (name === "barrier") {
              const qubits = gate.qubits.length === 0
                ? Array.from({ length: circuit.numQubits }, (_, i) => i)
                : gate.qubits;
              return (
                <g key={`gate-${index}`}>
                  {qubits.map((q) => (
                    <BarrierTick key={`barrier-${index}-${q}`} x={x} y={qubitY(q)} color={textColor} />
                  ))}
                </g>
              );
            }

            if (TWO_QUBIT_GATES.has(name) && gate.qubits.length >= 2) {
              const [q0, q1] = gate.qubits;
              const y0 = qubitY(q0);
              const y1 = qubitY(q1);
              const isControlGate = name === "cx" || name === "cnot" || name === "cz";
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
                    rx={12}
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
                  rx={9}
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
                <Box w="2.5" h="2.5" rounded="sm" bg={style.fill} flexShrink={0} />
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
}
