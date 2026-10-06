import { LEFT, RIGHT } from './shared.js'
import { circular } from './circular.js'

/**
 * C-SCAN — Circular SCAN.
 *
 * Services requests while travelling in one direction only. On reaching the
 * end of the disk it returns to the beginning and carries on in the *same*
 * direction, so every request waits roughly the same amount of time.
 *
 * @param {{diskSize:number, head:number, requests:number[], direction:'left'|'right'}} input
 */
export function cscan({ diskSize, head, requests, direction = RIGHT }) {
  return circular({
    diskSize,
    head,
    requests,
    direction: direction === LEFT ? LEFT : RIGHT,
    goToBoundary: true,
  })
}
