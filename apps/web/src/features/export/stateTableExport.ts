import { formatComponent } from "../../components/viz/StateTable";
import { basisLabels, probabilities, type StateVector } from "../quantum/simulate";

export function stateTableToCsv(amplitudes: StateVector, numQubits: number): string {
  const labels = basisLabels(numQubits);
  const probs = probabilities(amplitudes);
  const rows = labels.map((label, i) => {
    const amp = amplitudes[i];
    return [`|${label}⟩`, formatComponent(amp.re), formatComponent(amp.im), `${(probs[i] * 100).toFixed(1)}%`].join(
      ",",
    );
  });
  return ["Basis state,Re,Im,Probability", ...rows].join("\n");
}
