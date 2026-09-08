import { Box, HStack, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Suspense, lazy, useMemo } from "react";
import { LuActivity, LuChartColumn, LuGitBranch, LuGlobe, LuTable2 } from "react-icons/lu";
import { ClientOnly } from "../../../../components/ClientOnly";
import { CircuitDiagram } from "../../../../components/viz/CircuitDiagram";
import { ProbabilityBars } from "../../../../components/viz/ProbabilityBars";
import { StateTable } from "../../../../components/viz/StateTable";
import type { Circuit } from "../../../../content/schema";
import { blochVector, simulateCircuit } from "../../../../features/quantum/simulate";

const BlochSphere = lazy(() =>
  import("../../../../components/viz/BlochSphere").then((m) => ({ default: m.BlochSphere })),
);
const StateVectorChart = lazy(() =>
  import("../../../../components/viz/StateVectorChart").then((m) => ({ default: m.StateVectorChart })),
);

const VIEW_META = [
  { value: "circuit", label: "Circuit", icon: LuGitBranch },
  { value: "bloch", label: "Bloch", icon: LuGlobe },
  { value: "statevector", label: "Statevector", icon: LuActivity },
  { value: "probabilities", label: "Probabilities", icon: LuChartColumn },
  { value: "table", label: "Table", icon: LuTable2 },
] as const;

function ViewPreview({ view, circuit }: { view: (typeof VIEW_META)[number]["value"]; circuit: Circuit }) {
  const snapshots = useMemo(() => simulateCircuit(circuit), [circuit]);
  const amplitudes = snapshots[snapshots.length - 1]?.amplitudes;
  if (!amplitudes) return null;

  switch (view) {
    case "circuit":
      return (
        <Box w="full" maxH="260px" overflow="auto">
          <CircuitDiagram circuit={circuit} />
        </Box>
      );
    case "bloch":
      if (circuit.numQubits > 2) {
        return (
          <Text fontSize="xs" color="fg.muted">
            Only shown for 1-2 qubit circuits.
          </Text>
        );
      }
      // Exactly Visualization.tsx's own layout — BlochSphere already sizes
      // itself (aspectRatio/minH/w="full" internally), so it's rendered
      // directly with no extra wrapping box. An earlier version wrapped it
      // in a second aspectRatio Box, which is what was actually breaking
      // the render (nested aspect-ratio boxes fighting over height).
      return (
        <SimpleGrid columns={circuit.numQubits} gap="4" w="full">
          {Array.from({ length: circuit.numQubits }, (_, q) => (
            <ClientOnly key={q} fallback={<Skeleton aspectRatio={1} w="full" rounded="l3" />}>
              {() => (
                <Suspense fallback={<Skeleton aspectRatio={1} w="full" rounded="l3" />}>
                  <BlochSphere vector={blochVector(amplitudes, q)} />
                </Suspense>
              )}
            </ClientOnly>
          ))}
        </SimpleGrid>
      );
    case "statevector":
      return (
        <ClientOnly fallback={<Skeleton h="320px" w="full" rounded="l2" />}>
          {() => (
            <Suspense fallback={<Skeleton h="320px" w="full" rounded="l2" />}>
              <Box h="320px" w="full">
                <StateVectorChart amplitudes={amplitudes} numQubits={circuit.numQubits} />
              </Box>
            </Suspense>
          )}
        </ClientOnly>
      );
    case "probabilities":
      return (
        <Box w="full">
          <ProbabilityBars amplitudes={amplitudes} numQubits={circuit.numQubits} />
        </Box>
      );
    case "table":
      return (
        <Box w="full" maxH="320px" overflow="auto">
          <StateTable amplitudes={amplitudes} numQubits={circuit.numQubits} />
        </Box>
      );
  }
}

/**
 * Checking a view here used to just toggle a bare checkbox — an admin had
 * no way to tell "statevector" from "probabilities" without opening the
 * full lesson preview. This instead renders every view up front with the
 * exact components/simulator the real lesson page uses
 * (`Visualization.tsx`), fed by this block's own `circuit` field, so an
 * admin can see what each option actually draws before deciding to check
 * it — unchecked views just render dimmed rather than hidden.
 */
export function VisualizationViewsEditor({
  selected,
  circuit,
  onChange,
}: {
  selected: string[];
  circuit: Circuit | undefined;
  onChange: (next: string[]) => void;
}) {
  return (
    <VStack align="stretch" gap="2">
      {VIEW_META.map(({ value: view, label, icon: Icon }) => {
        const checked = selected.includes(view);
        return (
          <VStack key={view} align="stretch" gap="0" borderWidth="1px" borderColor="border" rounded="l2" overflow="hidden">
            <HStack
              as="label"
              gap="2.5"
              px="2.5"
              py="1.5"
              cursor="pointer"
              bg={checked ? "colorPalette.subtle" : undefined}
              colorPalette={checked ? "quantum" : undefined}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked ? [...selected, view] : selected.filter((v) => v !== view))}
              />
              <Icon size={16} />
              <Text fontSize="sm" fontWeight="medium">
                {label}
              </Text>
            </HStack>
            <Box w="full" p="3" borderTopWidth="1px" borderColor="border" opacity={checked ? 1 : 0.6}>
              {circuit ? (
                <ViewPreview view={view} circuit={circuit} />
              ) : (
                <Text fontSize="xs" color="fg.muted">
                  Fill in the circuit above to preview this view.
                </Text>
              )}
            </Box>
          </VStack>
        );
      })}
    </VStack>
  );
}
