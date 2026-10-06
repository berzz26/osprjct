import { LEFT, RIGHT } from './shared.js'
import { bidirectional } from './bidirectional.js'

/**
 * SCAN — the "elevator" algorithm.
 *
 * Services every request in the current direction, continues all the way to
 * the physical disk boundary, then reverses and collects the requests it
 * skipped. The direction of travel matters, so both left and right are handled
 * here rather than by flipping the result.
 *
 * @param {{diskSize:number, head:number, requests:number[], direction:'left'|'right'}} input
 */
export function scan({ diskSize, head, requests, direction = RIGHT }) {
  return bidirectional({
    diskSize,
    head,
    requests,
    direction: direction === LEFT ? LEFT : RIGHT,
    goToBoundary: true,
  })
}
