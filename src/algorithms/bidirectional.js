import { KIND, LEFT, RIGHT, enumerate, finalize, move, orderForDirection } from './shared.js'

/**
 * Shared engine for the bidirectional "elevator" algorithms.
 *
 * `goToBoundary` distinguishes the two families:
 *   - true  → SCAN: the head always rides to the physical end of the disk.
 *   - false → LOOK: the head reverses at the last pending request in that
 *             direction and never visits an empty end of the disk.
 *
 * @param {object} input
 * @param {boolean} input.goToBoundary
 */
export function bidirectional({ diskSize, head, requests, direction, goToBoundary }) {
  if (!requests || requests.length === 0) {
    return finalize(head, [], 0)
  }

  const lastCylinder = diskSize - 1
  const records = enumerate(requests)
  const pending = new Set(records.map((r) => r.index))
  const movements = []
  let current = head

  // How far the head is willing to travel in the current direction.
  const edge = direction === RIGHT ? lastCylinder : 0
  // "Ahead of me" means at-or-beyond the head along the direction of travel,
  // so a request sitting exactly under the head is serviced immediately.
  const isAhead = (record) =>
    direction === RIGHT ? record.value >= head : record.value <= head

  // ---- outward sweep -------------------------------------------------
  const outward = orderForDirection(records.filter(isAhead), direction)
  let lastServicedIndex = -1

  for (const record of outward) {
    if (!pending.has(record.index)) continue
    movements.push(move(current, record.value, KIND.REQUEST, { requestIndex: record.index }))
    current = record.value
    pending.delete(record.index)
    lastServicedIndex = movements.length - 1
  }

  // ---- turnaround ----------------------------------------------------
  if (pending.size > 0) {
    if (goToBoundary) {
      // SCAN rides all the way to the physical edge of the disk.
      if (edge !== current) {
        movements.push(
          move(current, edge, KIND.BOUNDARY, { reverses: true, reachedBoundary: true }),
        )
        current = edge
      }
    } else if (lastServicedIndex >= 0) {
      // LOOK reverses exactly where it stands, so there is no travel to record.
      movements[lastServicedIndex].reverses = true
    }
  } else if (lastServicedIndex >= 0) {
    movements[lastServicedIndex].reverses = true
  }

  // ---- return sweep --------------------------------------------------
  const inward = orderForDirection(
    records.filter((record) => !isAhead(record)),
    direction === RIGHT ? LEFT : RIGHT,
  )

  for (const record of inward) {
    if (!pending.has(record.index)) continue
    movements.push(move(current, record.value, KIND.REQUEST, { requestIndex: record.index }))
    current = record.value
    pending.delete(record.index)
  }

  return finalize(head, movements, requests.length)
}
