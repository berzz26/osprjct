import { LEFT, RIGHT } from './shared.js'
import { circular } from './circular.js'

/**
 * C-LOOK — Circular LOOK.
 *
 * Behaves exactly like C-SCAN but never travels to a physical disk boundary:
 * after the last request in the current direction it jumps directly to the
 * first pending request at the opposite end of the queue.
 *
 * @param {{diskSize:number, head:number, requests:number[], direction:'left'|'right'}} input
 */
export function clook({ diskSize, head, requests, direction = RIGHT }) {
  return circular({
    diskSize,
    head,
    requests,
    direction: direction === LEFT ? LEFT : RIGHT,
    goToBoundary: false,
  })
}
