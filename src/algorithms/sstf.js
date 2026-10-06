import { KIND, emptyResult, finalize, move } from './shared.js'

/**
 * SSTF — Shortest Seek Time First.
 *
 * Repeatedly services the pending request nearest the current head position.
 * Ties are broken in favour of the lower cylinder so the result is deterministic.
 *
 * Naive implementation: rescans the whole pending set each step → O(n²).
 */
export function sstf({ head, requests }) {
  if (!requests || requests.length === 0) return emptyResult(head)

  const pending = requests.map((value, index) => ({ value, index }))
  const movements = []
  let current = head

  while (pending.length > 0) {
    let best = 0
    let bestDistance = Math.abs(pending[0].value - current)

    for (let i = 1; i < pending.length; i += 1) {
      const distance = Math.abs(pending[i].value - current)
      if (distance < bestDistance) {
        best = i
        bestDistance = distance
      }
    }

    const [chosen] = pending.splice(best, 1)
    movements.push(move(current, chosen.value, KIND.REQUEST, { requestIndex: chosen.index }))
    current = chosen.value
  }

  return finalize(head, movements, requests.length)
}
