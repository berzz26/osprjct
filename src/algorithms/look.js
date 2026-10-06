import { LEFT, RIGHT } from './shared.js'
import { bidirectional } from './bidirectional.js'

/**
 * LOOK — SCAN without the pointless trip to the disk edge.
 *
 * Identical to SCAN except that the head reverses direction as soon as there
 * are no more pending requests ahead of it, so it stops at the last request
 * in that direction instead of at cylinder 0 or diskSize-1.
 *
 * @param {{diskSize:number, head:number, requests:number[], direction:'left'|'right'}} input
 */
export function look({ diskSize, head, requests, direction = RIGHT }) {
  return bidirectional({
    diskSize,
    head,
    requests,
    direction: direction === LEFT ? LEFT : RIGHT,
    goToBoundary: false,
  })
}
