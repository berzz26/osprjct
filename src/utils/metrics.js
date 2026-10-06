import { KIND } from '../algorithms/index.js'

/**
 * Presentation helpers for the result numbers. All values are derived from the
 * algorithm output — nothing here is precomputed.
 */

/** Round to at most 2 decimals and drop a pointless trailing ".00". */
export function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return '0'
  const factor = 10 ** decimals
  const rounded = Math.round(value * factor) / factor
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals)
}

/**
 * Efficiency = share of total head travel that actually reached a request.
 * Kept for the optional "Details" section only.
 */
export function efficiency(result) {
  if (result.totalMovement === 0) return 100
  const useful = result.movements
    .filter((m) => m.kind === KIND.REQUEST)
    .reduce((sum, m) => sum + m.distance, 0)
  return (useful / result.totalMovement) * 100
}

/**
 * The three headline numbers, plus a few extras for the optional Details
 * section. Units always say "positions", never "cylinders".
 */
export function buildResult(result, requestCount) {
  const emptyTravel = result.movements
    .filter((m) => m.kind !== KIND.REQUEST)
    .reduce((sum, m) => sum + m.distance, 0)

  return {
    headline: [
      {
        key: 'total',
        label: 'Total head movement',
        value: round(result.totalMovement),
        unit: 'positions',
        help: 'Total distance travelled by the disk head.',
      },
      {
        key: 'served',
        label: 'Requests completed',
        value: `${result.requestsServed} / ${requestCount}`,
        unit: '',
        help: 'Number of requests successfully visited.',
      },
      {
        key: 'average',
        label: 'Average movement',
        value: round(result.averageSeek),
        unit: 'positions/request',
        help: 'Average distance travelled per request.',
      },
    ],
    details: [
      { label: 'Longest single move', value: `${round(result.maxSeek)} positions` },
      { label: 'Travel without reading', value: `${round(emptyTravel)} positions` },
      { label: 'Efficiency', value: `${round(efficiency(result), 1)}% of travel reached a request` },
    ],
  }
}
