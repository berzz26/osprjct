import { clook } from './clook.js'
import { cscan } from './cscan.js'
import { fcfs } from './fcfs.js'
import { LEFT, RIGHT, KIND } from './shared.js'
import { look } from './look.js'
import { scan } from './scan.js'
import { sstf } from './sstf.js'

export { KIND, LEFT, RIGHT }

/** Every algorithm, in teaching order. */
export const ALGORITHMS = {
  FCFS: { id: 'FCFS', run: fcfs, directional: false },
  SSTF: { id: 'SSTF', run: sstf, directional: false },
  SCAN: { id: 'SCAN', run: scan, directional: true },
  LOOK: { id: 'LOOK', run: look, directional: true },
  'C-SCAN': { id: 'C-SCAN', run: cscan, directional: true },
  'C-LOOK': { id: 'C-LOOK', run: clook, directional: true },
}

export const ALGORITHM_IDS = Object.keys(ALGORITHMS)

export const COMPARE_ALL = 'Compare All'

/** True when the given algorithm actually cares about the head direction. */
export function isDirectional(id) {
  return Boolean(ALGORITHMS[id]?.directional)
}

/**
 * Run a single algorithm. Returns the raw result shape plus a little metadata
 * the UI can use without recomputing anything.
 */
export function simulate(id, input) {
  const algorithm = ALGORITHMS[id]
  if (!algorithm) throw new Error(`Unknown algorithm: ${id}`)

  const result = algorithm.run(input)
  return { id, ...result, directional: algorithm.directional }
}

/**
 * Run every algorithm against the *same* input so the comparison table is
 * always apples-to-apples.
 */
export function simulateAll(input) {
  return ALGORITHM_IDS.map((id) => simulate(id, input))
}
