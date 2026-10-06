import { KIND } from '../algorithms/index.js'
import { round } from './metrics.js'

/**
 * Plain-English narration for the animation.
 *
 * Every sentence answers "why did the head go there?" using beginner language:
 * "positions" instead of "cylinders", "waiting requests" instead of "pending
 * queue", "request order" instead of "seek sequence".
 */

const dirOf = (movement) =>
  movement.to > movement.from ? 'right' : movement.to < movement.from ? 'left' : null

/** "Next: 65" label for the step card. Non-request legs get honest labels. */
export function upcomingLabel(movement) {
  if (!movement) return 'Done'
  if (movement.kind === KIND.BOUNDARY) return `Disk end (${movement.to})`
  if (movement.kind === KIND.WRAP) return `Back to start (${movement.to})`
  return String(movement.to)
}

/**
 * "Why?" sentence for the upcoming movement.
 * @param {object} args
 * @param {object} args.movement the movement about to be performed
 * @param {number} args.index zero-based index of that movement
 * @param {number} args.total how many movements the run has
 */
export function narrateStep({ algorithm, movement, index, total }) {
  const away = dirOf(movement)
  const d = round(movement.distance)
  const unit = d === '1' || d === 1 ? 'position' : 'positions'

  if (movement.kind === KIND.BOUNDARY) {
    return `Nothing is waiting ${away ?? 'that way'}, so the head keeps moving to the end of the disk at ${movement.to}. Those ${d} ${unit} read nothing.`
  }
  if (movement.kind === KIND.WRAP) {
    return `Return to the beginning: jump from ${movement.from} to ${movement.to} (${d} ${unit}), then keep moving the same way.`
  }
  if (movement.distance === 0) {
    return `The head is already at ${movement.to}, so this request needs no movement at all.`
  }

  const travel = `Move ${d} ${unit} ${away}`

  switch (algorithm) {
    case 'FCFS': {
      const order = movement.requestIndex != null ? movement.requestIndex + 1 : index + 1
      return `${travel}: request ${order} of ${total} arrived before the others, and FCFS never skips the queue.`
    }
    case 'SSTF':
      return `${travel}: ${movement.to} is the closest waiting request, so SSTF goes there first.`
    case 'SCAN':
    case 'LOOK':
      return movement.reverses
        ? `${movement.to} is the last request ${away}. Turn around here and head back the other way.`
        : `${travel}: ${movement.to} is the next request on the way.`
    case 'C-SCAN':
    case 'C-LOOK':
      return `${travel}: ${movement.to} is the next request in this direction.`
    default:
      return `${travel} to ${movement.to}.`
  }
}

/** Sentence shown before the first play. */
export function readySentence({ head, count }) {
  return `Press Play. The head starts at position ${head} and will visit ${count} waiting request${count === 1 ? '' : 's'}.`
}

/** Sentence shown when the run finishes. */
export function doneSentence({ served, total }) {
  return `Done — all ${served} requests visited. Total distance: ${round(total)} positions.`
}

/**
 * Waiting requests at the current playback step, in an order that makes sense
 * for the algorithm (arrival order for FCFS, ascending otherwise).
 * @returns {{value:number, count:number}[]}
 */
export function waitingRequests({ algorithm, input, result, step }) {
  // Every REQUEST movement records which queue entry it serviced, so the
  // waiting set is simply the queue minus those entries. Duplicates stay
  // correct because each copy has its own index.
  const serviced = new Set()
  for (const movement of result.movements.slice(0, step)) {
    if (movement.kind === KIND.REQUEST && movement.requestIndex != null) {
      serviced.add(movement.requestIndex)
    }
  }

  const remaining = input.requests.filter((_, queueIndex) => !serviced.has(queueIndex))
  const ordered =
    algorithm === 'FCFS' ? remaining : [...remaining].sort((a, b) => a - b)

  const collapsed = []
  for (const value of ordered) {
    const last = collapsed[collapsed.length - 1]
    if (last && last.value === value) last.count += 1
    else collapsed.push({ value, count: 1 })
  }
  return collapsed
}
