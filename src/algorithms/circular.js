import { KIND, RIGHT, enumerate, finalize, move, orderForDirection } from './shared.js'

/**
 * Shared engine for the circular algorithms.
 *
 * `goToBoundary` distinguishes:
 *   - true  → C-SCAN: ride to the physical end, then jump all the way back to
 *             cylinder 0 (or diskSize-1) before continuing in the same
 *             direction. Customers get an equal wait regardless of position.
 *   - false → C-LOOK: skip the empty end entirely and jump straight from the
 *             last serviced request to the first pending one at the far end.
 *
 * @param {object} input
 * @param {boolean} input.goToBoundary
 */
export function circular({ diskSize, head, requests, direction, goToBoundary }) {
  if (!requests || requests.length === 0) {
    return finalize(head, [], 0)
  }

  const lastCylinder = diskSize - 1
  const records = enumerate(requests)
  const pending = new Set(records.map((r) => r.index))
  const movements = []
  let current = head

  const edge = direction === RIGHT ? lastCylinder : 0
  const farEdge = direction === RIGHT ? 0 : lastCylinder
  const isAhead = (record) =>
    direction === RIGHT ? record.value >= head : record.value <= head

  // ---- outward sweep -------------------------------------------------
  for (const record of orderForDirection(records.filter(isAhead), direction)) {
    if (!pending.has(record.index)) continue
    movements.push(move(current, record.value, KIND.REQUEST, { requestIndex: record.index }))
    current = record.value
    pending.delete(record.index)
  }

  // ---- wrap around ---------------------------------------------------
  if (pending.size > 0) {
    // The remaining requests, in the order the head will visit them next.
    const rest = orderForDirection(
      records.filter((record) => !isAhead(record)),
      direction,
    )

    if (goToBoundary) {
      // Ride to the physical edge first…
      if (edge !== current) {
        movements.push(move(current, edge, KIND.BOUNDARY, { reachedBoundary: true }))
        current = edge
      }
      // …then jump to the opposite physical edge, still travelling the same way.
      movements.push(move(current, farEdge, KIND.WRAP, { wrap: true }))
      current = farEdge
    } else if (rest.length > 0) {
      // Jump straight to the first pending request at the far end.
      movements.push(move(current, rest[0].value, KIND.WRAP, { wrap: true }))
      current = rest[0].value
      pending.delete(rest[0].index)
    }
  }

  // ---- continue in the same direction --------------------------------
  for (const record of orderForDirection(records.filter((record) => !isAhead(record)), direction)) {
    if (!pending.has(record.index)) continue
    movements.push(move(current, record.value, KIND.REQUEST, { requestIndex: record.index }))
    current = record.value
    pending.delete(record.index)
  }

  return finalize(head, movements, requests.length)
}
