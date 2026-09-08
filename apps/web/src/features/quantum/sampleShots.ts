/**
 * Draws `shots` samples from a discrete probability distribution, simulating
 * what running a circuit on a real backend (or Aer) `shots` times and reading
 * off `job.result().get_counts()` would produce — noisy at low shot counts,
 * converging to `probabilities` as `shots` grows.
 */
export function sampleShots(probabilities: number[], shots: number): number[] {
  const counts = new Array(probabilities.length).fill(0);
  const cumulative: number[] = [];
  let acc = 0;
  for (const p of probabilities) {
    acc += p;
    cumulative.push(acc);
  }

  for (let i = 0; i < shots; i++) {
    const r = Math.random();
    const index = cumulative.findIndex((c) => r < c);
    counts[index === -1 ? counts.length - 1 : index] += 1;
  }

  return counts;
}
