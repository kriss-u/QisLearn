import { Box } from "@chakra-ui/react";
import { Html, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, type CSSProperties } from "react";
import { ketLatex } from "./gateLatexLabels";
import { KatexSpan, useVizLatex } from "./latexLabels";

const ketLabelStyle: CSSProperties = {
  color: "#a3a3a3",
  fontFamily: "'Fira Code', ui-monospace, monospace",
  fontSize: "13px",
  whiteSpace: "nowrap",
  pointerEvents: "none",
};

export interface BlochSphereProps {
  vector: [number, number, number];
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

function Axis({ from, to, color, label }: { from: [number, number, number]; to: [number, number, number]; color: string; label: string }) {
  return (
    <>
      <Line points={[from, to]} color={color} lineWidth={1.5} />
      <Text position={to} fontSize={0.12} color={color} anchorX="center" anchorY="middle">
        {label}
      </Text>
    </>
  );
}

function CanvasReadyReporter({ onCanvasReady }: { onCanvasReady?: (canvas: HTMLCanvasElement) => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    onCanvasReady?.(gl.domElement);
  }, [gl, onCanvasReady]);
  return null;
}

function BlochScene({
  vector,
  onCanvasReady,
}: {
  vector: [number, number, number];
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}) {
  const [x, y, z] = vector;
  const latex = useVizLatex();
  // Bloch (x, y, z) -> three.js (x, z, y) so the |0⟩ pole points up.
  const tip: [number, number, number] = [x, z, y];

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={0.8} />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.1} wireframe={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.22} />
      </mesh>

      <Axis from={[-1.2, 0, 0]} to={[1.2, 0, 0]} color="#f87171" label="x" />
      <Axis from={[0, -1.2, 0]} to={[0, 1.2, 0]} color="#fb7a3c" label="z" />
      <Axis from={[0, 0, -1.2]} to={[0, 0, 1.2]} color="#60a5fa" label="y" />

      <Html position={[0, 1.32, 0]} center style={ketLabelStyle}>
        {latex ? <KatexSpan tex={ketLatex("0")} /> : "|0⟩"}
      </Html>
      <Html position={[0, -1.32, 0]} center style={ketLabelStyle}>
        {latex ? <KatexSpan tex={ketLatex("1")} /> : "|1⟩"}
      </Html>

      <Line points={[[0, 0, 0], tip]} color="#22d3ee" lineWidth={3} />
      <mesh position={tip}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#22d3ee" />
      </mesh>

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={6} />
      <CanvasReadyReporter onCanvasReady={onCanvasReady} />
    </>
  );
}

export function BlochSphere({ vector, onCanvasReady }: BlochSphereProps) {
  return (
    <Box borderWidth="1px" borderColor="border" rounded="l3" bg="bg.panel" h="320px" position="relative" overflow="hidden">
      <Canvas camera={{ position: [2.4, 1.8, 2.4], fov: 45 }} gl={{ preserveDrawingBuffer: true }} dpr={[1, 3]}>
        <BlochScene vector={vector} onCanvasReady={onCanvasReady} />
      </Canvas>
    </Box>
  );
}
