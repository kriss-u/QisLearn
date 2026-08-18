import { markdownElements } from "./markdownElements";
import { CodeExercise } from "./mdx/CodeExercise";
import { ComplexPlaneExplorer } from "./mdx/ComplexPlaneExplorer";
import { GroverRotationPlayground } from "./mdx/GroverRotationPlayground";
import { Measurement } from "./mdx/Measurement";
import { MatrixTransformPlayground } from "./mdx/MatrixTransformPlayground";
import { ModularExponentiationExplorer } from "./mdx/ModularExponentiationExplorer";
import { OracleFigure } from "./mdx/OracleFigure";
import { PhaseEstimationPlayground } from "./mdx/PhaseEstimationPlayground";
import { QFTPhaseWheel } from "./mdx/QFTPhaseWheel";
import { Quiz } from "./mdx/Quiz";
import { TensorProductBuilder } from "./mdx/TensorProductBuilder";
import { Visualization } from "./mdx/Visualization";

/**
 * Passed as the `components` prop to every compiled lesson MDX component.
 * Covers both the standard markdown element overrides (h1, p, code, ...) and
 * the interactive tags authors can drop into lesson body content.
 */
export const mdxComponents = {
  ...markdownElements,
  CodeExercise,
  Quiz,
  Visualization,
  Measurement,
  OracleFigure,
  ComplexPlaneExplorer,
  MatrixTransformPlayground,
  TensorProductBuilder,
  GroverRotationPlayground,
  QFTPhaseWheel,
  PhaseEstimationPlayground,
  ModularExponentiationExplorer,
};
