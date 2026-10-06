/**
 * Input parsing and validation.
 *
 * The simulator must never crash on bad input, so every field is parsed
 * defensively and reported back as a list of human-readable messages.
 */

export const LIMITS = {
  minDiskSize: 2,
  maxDiskSize: 100000,
  maxRequests: 200,
}

/** Parse a numeric field, returning `fallback` when it is not a usable number. */
export function toNumber(value, fallback = NaN) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const text = String(value ?? '').trim()
  if (text === '') return fallback
  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : fallback
}

/** Parse a cylinder count, only accepting whole numbers. */
export function toCylinderCount(value) {
  const parsed = toNumber(value)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) return NaN
  return parsed
}

/**
 * Split a free-text request queue into tokens.
 * Accepts commas, spaces, newlines and tabs as separators.
 */
export function tokenizeRequests(text) {
  return String(text ?? '')
    .split(/[\s,]+/)
    .filter((token) => token !== '')
}

/**
 * Parse the request queue.
 *
 * Duplicates are deliberately *allowed* — each occurrence is a separate disk
 * request and is serviced in turn, which is a legitimate workload.
 *
 * @returns {{requests:number[], invalid:string[], outOfRange:number[], duplicates:number[], tokenCount:number}}
 */
export function parseRequests(text, lastCylinder = Infinity) {
  const tokens = tokenizeRequests(text)
  const invalid = []
  const outOfRange = []
  const requests = []
  const seen = new Map()

  for (const token of tokens) {
    // Tolerate "98." or "+98" but reject "12a", "1.5" and bare signs.
    if (!/^[+-]?\d+(\.\d+)?$/.test(token)) {
      invalid.push(token)
      continue
    }
    const value = Number(token)
    if (!Number.isInteger(value)) {
      invalid.push(token)
      continue
    }
    if (value < 0 || value > lastCylinder) {
      outOfRange.push(value)
      continue
    }
    requests.push(value)
    seen.set(value, (seen.get(value) ?? 0) + 1)
  }

  const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([value]) => value)

  return { requests, invalid, outOfRange, duplicates, tokenCount: tokens.length }
}

/**
 * Validate the whole configuration.
 *
 * @returns {{
 *   valid: boolean,
 *   diskSize:number, head:number, requests:number[],
 *   errors:{diskSize?:string, head?:string, requests?:string[]},
 *   notices:string[]
 * }}
 */
export function validateConfig({ diskSize, head, requestText }) {
  const errors = {}
  const notices = []

  const size = toCylinderCount(diskSize)
  let lastCylinder = Infinity
  let resolvedHead = toCylinderCount(head)

  if (!Number.isFinite(size)) {
    errors.diskSize = 'Disk size must be a whole number.'
  } else if (size < LIMITS.minDiskSize) {
    errors.diskSize = `Disk size must be at least ${LIMITS.minDiskSize} positions.`
  } else if (size > LIMITS.maxDiskSize) {
    errors.diskSize = `Disk size cannot exceed ${LIMITS.maxDiskSize.toLocaleString()} positions.`
  } else {
    lastCylinder = size - 1
  }

  if (!Number.isFinite(resolvedHead)) {
    errors.head = 'Starting position must be a whole number.'
  } else if (Number.isFinite(size) && (resolvedHead < 0 || resolvedHead > lastCylinder)) {
    errors.head = `Starting position must be between 0 and ${lastCylinder}.`
  }

  const parsed = parseRequests(requestText, lastCylinder)

  if (parsed.tokenCount === 0) {
    errors.requests = ['Enter at least one request, for example: 98, 183, 37, 122.']
  } else {
    const problems = []
    if (parsed.invalid.length > 0) {
      problems.push(`Not a disk position: ${parsed.invalid.slice(0, 6).join(', ')}${parsed.invalid.length > 6 ? '…' : ''}`)
    }
    if (parsed.outOfRange.length > 0) {
      problems.push(
        Number.isFinite(lastCylinder)
          ? `Outside the disk (0–${lastCylinder}): ${parsed.outOfRange.slice(0, 6).join(', ')}${parsed.outOfRange.length > 6 ? '…' : ''}`
          : `Negative positions: ${parsed.outOfRange.slice(0, 6).join(', ')}${parsed.outOfRange.length > 6 ? '…' : ''}`,
      )
    }
    if (parsed.requests.length > LIMITS.maxRequests) {
      problems.push(`Please keep it to ${LIMITS.maxRequests} requests or fewer so the animation stays readable.`)
    }
    if (parsed.requests.length === 0 && problems.length === 0) {
      problems.push('No valid requests were found.')
    }
    if (problems.length > 0) errors.requests = problems
  }

  if (parsed.duplicates.length > 0) {
    notices.push(
      `Duplicate request${parsed.duplicates.length > 1 ? 's' : ''} ${parsed.duplicates.join(', ')} — each copy is serviced separately.`,
    )
  }

  const valid =
    !errors.diskSize && !errors.head && !errors.requests && parsed.requests.length > 0

  return {
    valid,
    diskSize: Number.isFinite(size) ? size : 200,
    head: Number.isFinite(resolvedHead) ? resolvedHead : 0,
    requests: parsed.requests,
    errors,
    notices,
  }
}

/** Produce a random, guaranteed-valid queue for the current disk size. */
export function randomRequests(diskSize, count = 10, seed = Math.random()) {
  const lastCylinder = diskSize - 1
  const generated = new Set()
  let state = Math.floor(seed * 1e9) || 1

  const next = () => {
    // Cheap deterministic-enough LCG so the button feels varied but never loops.
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }

  const target = Math.min(count, lastCylinder + 1)
  let guard = 0
  while (generated.size < target && guard < target * 20) {
    generated.add(Math.floor(next() * (lastCylinder + 1)))
    guard += 1
  }
  return [...generated].sort((a, b) => a - b)
}
