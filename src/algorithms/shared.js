/**
 * Shared helpers for every disk-scheduling algorithm.
 *
 * Nothing in this folder may import React or touch the DOM — the algorithms are
 * pure functions so they can be unit-tested and reused anywhere.
 */

/** Valid disk head directions. */
export const LEFT = 'left'
export const RIGHT = 'right'

/** Classification of a single head movement. */
export const KIND = {
  /** The head landed on a cylinder that had a pending request. */
  REQUEST: 'request',
  /** The head travelled to a physical disk boundary (SCAN / C-SCAN only). */
  BOUNDARY: 'boundary',
  /** The head jumped from one end of the disk to the other (C-SCAN / C-LOOK). */
  WRAP: 'wrap',
}

export const abs = (n) => Math.abs(n)

/**
 * Build the movement record for one leg of the head's journey.
 * `from` and `to` are always inclusive cylinder numbers.
 */
export function move(from, to, kind = KIND.REQUEST, extra = {}) {
  return { from, to, distance: abs(to - from), kind, ...extra }
}

/**
 * Attach request indices to cylinders so that duplicate requests stay
 * individually traceable, then sort ascending.
 */
export function enumerate(requests) {
  return requests
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index)
}

/** Order a list of `{value,index}` records for a given sweep direction. */
export function orderForDirection(records, direction) {
  const sorted = [...records].sort((a, b) => a.value - b.value)
  return direction === LEFT ? sorted.reverse() : sorted
}

/**
 * Finalise a raw list of movements into the public result shape.
 *
 * `sequence` is the full list of cylinders the head occupied, head position
 * first. `averageSeek` divides by the number of *serviced requests* (not the
 * number of movements) which is the convention taught in OS courses.
 */
export function finalize(start, movements, requestsServed) {
  // A zero-length movement still represents a serviced request (or a boundary
  // visit), but it must not repeat the cylinder in the sequence.
  const sequence = [start]
  for (const m of movements) {
    if (m.to !== sequence[sequence.length - 1]) sequence.push(m.to)
  }

  const totalMovement = movements.reduce((sum, m) => sum + m.distance, 0)
  const seekDistances = movements
    .filter((m) => m.kind === KIND.REQUEST)
    .map((m) => m.distance)
  const maxSeek = seekDistances.length ? Math.max(...seekDistances) : 0
  const usefulMovement = seekDistances.reduce((sum, d) => sum + d, 0)

  return {
    sequence,
    movements,
    totalMovement,
    averageSeek: requestsServed > 0 ? totalMovement / requestsServed : 0,
    maxSeek,
    usefulMovement,
    wastedMovement: totalMovement - usefulMovement,
    requestsServed,
  }
}

/** An empty-but-valid result, used for degenerate inputs such as an empty queue. */
export function emptyResult(start) {
  return finalize(start, [], 0)
}
