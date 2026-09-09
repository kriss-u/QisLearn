import { Field, Input, NumberInput, Switch, VStack } from "@chakra-ui/react";
import type { FieldKind } from "@qislearn/graphql-schema";
import type { Circuit } from "../../../../content/schema";
import { CircuitFieldEditor } from "./CircuitFieldEditor";
import { InlineMathFieldEditor } from "./InlineMathFieldEditor";
import { MarkdownFieldEditor } from "./MarkdownFieldEditor";
import { MatrixPresetsEditor, type MatrixPresetValue } from "./MatrixPresetsEditor";
import { PyCodeFieldEditor } from "./PyCodeFieldEditor";
import { NumberArrayEditor, StringArrayEditor } from "./StringArrayEditor";
import { QuizChoicesEditor, type QuizChoiceValue } from "./QuizChoicesEditor";
import { VisualizationViewsEditor } from "./VisualizationViewsEditor";

export interface BlockFieldSpec {
  name: string;
  label: string;
  kind: FieldKind;
  required: boolean;
}

export function DynamicBlockForm({
  fields,
  data,
  onChange,
}: {
  fields: BlockFieldSpec[];
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  function setField(name: string, value: unknown) {
    onChange({ ...data, [name]: value });
  }

  return (
    <VStack align="stretch" gap="3">
      {fields.map((field) => {
        const value = data[field.name];
        return (
          <Field.Root key={field.name} required={field.required}>
            <Field.Label fontSize="xs">
              {field.label}
              {field.required && <Field.RequiredIndicator />}
            </Field.Label>
            {renderInput(field, value, (next) => setField(field.name, next), data)}
          </Field.Root>
        );
      })}
    </VStack>
  );
}

function renderInput(field: BlockFieldSpec, value: unknown, onChange: (next: unknown) => void, data: Record<string, unknown>) {
  switch (field.kind) {
    case "STRING":
      return (
        <Input
          variant="flushed"
          size="sm"
          w="full"
          fontFamily="mono"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "LONG_TEXT":
      // Every remaining LONG_TEXT field is Python (QiskitCodeExercise's
      // starterCode/solutionCode) — real syntax highlighting instead of a
      // plain mono textarea, same editor learners get.
      return <PyCodeFieldEditor value={typeof value === "string" ? value : ""} onChange={onChange} />;
    case "INLINE_MATH":
      return <InlineMathFieldEditor value={typeof value === "string" ? value : ""} onChange={onChange} />;
    case "MARKDOWN":
      return (
        <MarkdownFieldEditor
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          height={field.name === "text" ? 320 : 220}
        />
      );
    case "NUMBER":
      return (
        <NumberInput.Root
          size="sm"
          value={typeof value === "number" ? String(value) : ""}
          onValueChange={(d) => onChange(d.valueAsNumber)}
        >
          <NumberInput.Input />
        </NumberInput.Root>
      );
    case "BOOLEAN":
      return <Switch.Root checked={Boolean(value)} onCheckedChange={(d) => onChange(d.checked)}>
        <Switch.HiddenInput />
        <Switch.Control />
      </Switch.Root>;
    case "STRING_ARRAY":
      return <StringArrayEditor value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "NUMBER_ARRAY":
      return <NumberArrayEditor value={Array.isArray(value) ? (value as number[]) : []} onChange={onChange} />;
    case "QUIZ_CHOICES":
      return (
        <QuizChoicesEditor value={Array.isArray(value) ? (value as QuizChoiceValue[]) : []} onChange={onChange} />
      );
    case "MATRIX_PRESETS":
      return (
        <MatrixPresetsEditor
          value={Array.isArray(value) ? (value as MatrixPresetValue[]) : []}
          onChange={onChange}
        />
      );
    case "VISUALIZATION_VIEWS":
      return (
        <VisualizationViewsEditor
          selected={Array.isArray(value) ? (value as string[]) : []}
          circuit={data.circuit as Circuit | undefined}
          onChange={onChange}
        />
      );
    case "CIRCUIT":
      return <CircuitFieldEditor value={value} onChange={onChange} />;
    default:
      return null;
  }
}
