import { KIND, emptyResult, finalize, move } from './shared.js'

/**
 * FCFS — First Come First Serve.
 *
 * Requests are serviced in exactly the order they were queued; the head never
 * optimises, it simply walks the queue.
 *
 * @param {{diskSize:number, head:number, requests:number[], direction?:string}} input
 */
export function fcfs({ head, requests }) {
  if (!requests || requests.length === 0) return emptyResult(head)

  const movements = []
  let current = head

  requests.forEach((target, index) => {
    movements.push(move(current, target, KIND.REQUEST, { requestIndex: index }))
    current = target
  })

  return finalize(head, movements, requests.length)
}
