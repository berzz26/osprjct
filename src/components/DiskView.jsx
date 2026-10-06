import { useMemo } from 'react'
import { KIND } from '../algorithms/index.js'

/**
 * The disk: a horizontal line of numbered positions.
 *
 * - grey dots = waiting requests
 * - green dots = already visited
 * - yellow marker = the current head position
 * - the line behind the head = where it has travelled
 */

const LABEL_ROW = 16
const MAX_ROWS = 2

export default function DiskView({ config, result, step, large = false }) {
  const { diskSize, head, requests } = config
  const last = Math.max(diskSize - 1, 1)
  const at = useMemo(() => (position) => (position / last) * 100, [last])

  const movements = result?.movements ?? []
  const travelled = movements.slice(0, step)
  const current = travelled.length > 0 ? travelled[travelled.length - 1].to : head

  const visited = useMemo(() => {
    const counts = new Map()
    for (const movement of travelled) {
      if (movement.kind === KIND.REQUEST) {
        counts.set(movement.to, (counts.get(movement.to) ?? 0) + 1)
      }
    }
    return counts
  }, [travelled])

  /** One dot per distinct position; duplicates share the dot. */
  const dots = useMemo(() => {
    const counts = new Map()
    for (const value of requests) counts.set(value, (counts.get(value) ?? 0) + 1)
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value)
  }, [requests])

  /** Pack labels into at most two rows so none overlap. */
  const packed = useMemo(() => {
    const gap = large ? 3.4 : 4.6
    const ends = []
    return dots.map((dot) => {
      const pct = at(dot.value)
      let row = ends.findIndex((end) => pct - end >= gap)
      if (row === -1) {
        row = ends.length < MAX_ROWS ? ends.length : MAX_ROWS - 1
        if (ends.length < MAX_ROWS) ends.push(pct)
      }
      ends[row] = pct + gap
      return { ...dot, pct, row }
    })
  }, [dots, at, large])

  return (
    <div>
      {/* labels, each tethered to its dot */}
      <div className="relative" style={{ height: LABEL_ROW * MAX_ROWS }}>
        {packed.map((dot) => {
          const done = (visited.get(dot.value) ?? 0) > 0
          const top = dot.row * LABEL_ROW
          return (
            <div key={dot.value}>
              <span
                className={`absolute w-px ${done ? 'bg-served/30' : 'bg-subtle/25'}`}
                style={{
                  left: `${dot.pct}%`,
                  top: `${top + 13}px`,
                  height: `${LABEL_ROW * MAX_ROWS - top - 13}px`,
                }}
              />
              <span
                className={`num absolute -translate-x-1/2 text-[12px] leading-none ${
                  done ? 'text-served/80' : 'text-subtle'
                }`}
                style={{ left: `${dot.pct}%`, top: `${top}px` }}
              >
                {dot.value}
                {dot.count > 1 ? <span className="text-[10px] text-muted"> ×{dot.count}</span> : null}
              </span>
            </div>
          )
        })}
      </div>

      {/* the disk line */}
      <div className={`relative ${large ? 'h-10' : 'h-8'}`}>
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-base-700" />

        {/* where the head has travelled */}
        {travelled.map((movement, index) => (
          <Leg key={index} movement={movement} at={at} />
        ))}

        {/* request dots */}
        {dots.map((dot) => {
          const done = (visited.get(dot.value) ?? 0) > 0
          return (
            <span
              key={`dot-${dot.value}`}
              title={dot.count > 1 ? `Position ${dot.value} — requested ${dot.count} times` : `Position ${dot.value}`}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                large ? 'size-3' : 'size-2.5'
              } ${done ? 'bg-served' : 'bg-subtle'}`}
              style={{ left: `${at(dot.value)}%` }}
            />
          )
        })}

        {/* the head */}
        <span
          className="pointer-events-none absolute z-10 -translate-x-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${at(current)}%`, top: '-14px', bottom: '-34px' }}
        >
          <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-head shadow-[0_0_16px] shadow-head/60" />
          <span
            className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -rotate-45 bg-head"
            style={{ animation: 'var(--animate-head-glow)' }}
          />
          <span
            className={`num absolute left-1/2 whitespace-nowrap rounded-md border border-head/50 bg-base-950 px-2 py-0.5 font-semibold text-head ${
              large ? 'text-base' : 'text-xs'
            }`}
            style={{ transform: 'translateX(-50%)', bottom: 0 }}
          >
            HEAD: {current}
          </span>
        </span>
      </div>

      {/* ends of the disk */}
      <div className={`num flex items-center justify-between text-muted ${large ? 'mt-10 text-sm' : 'mt-9 text-xs'}`}>
        <span>0</span>
        <span>
          {diskSize} positions · 0 – {last}
        </span>
        <span>{last}</span>
      </div>
    </div>
  )
}

/** One travelled leg. Solid green serviced a request; dashed crossed emptiness. */
function Leg({ movement, at }) {
  const { from, to, distance, kind } = movement

  if (distance === 0) {
    return (
      <span
        className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-served"
        style={{ left: `${at(to)}%` }}
      />
    )
  }

  const left = Math.min(at(from), at(to))
  const width = Math.abs(at(to) - at(from))
  const empty = kind === KIND.BOUNDARY || kind === KIND.WRAP

  return (
    <span
      className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full transition-[width,left] duration-500 ${
        empty
          ? `bg-[repeating-linear-gradient(90deg,currentColor_0_5px,transparent_5px_10px)] ${kind === KIND.BOUNDARY ? 'text-boundary' : 'text-wrap'}`
          : 'bg-served/90'
      }`}
      style={{ left: `${left}%`, width: `${Math.max(width, 0.2)}%` }}
    />
  )
}

/** The only legend: Waiting, Visited, Current. */
export function DiskKey() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-subtle">
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-subtle" /> Waiting
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-served" /> Visited
      </span>
      <span className="flex items-center gap-2">
        <span className="h-4 w-[3px] rounded-full bg-head" /> Current
      </span>
    </div>
  )
}
