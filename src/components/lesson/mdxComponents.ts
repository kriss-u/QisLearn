import { markdownElements } from "./markdownElements";
import { CodeExercise } from "./mdx/CodeExercise";
import { Measurement } from "./mdx/Measurement";
import { OracleFigure } from "./mdx/OracleFigure";
import { Quiz } from "./mdx/Quiz";
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
};
