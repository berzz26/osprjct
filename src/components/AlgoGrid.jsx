import { ALGORITHM_INFO } from '../data/algorithmInfo.js'

/**
 * "How do the algorithms differ?" — six small cards, each with a one-line
 * idea and a tiny diagram of the head's route. Clicking a card selects that
 * algorithm.
 *
 * All diagrams share one demo: head starts at 50, requests wait at
 * 20 / 45 / 70 / 90, direction is right.
 */

// Positions the head visits, in order. `wrap` legs are drawn dashed.
const ROUTES = {
  FCFS: { path: [50, 70, 20, 90, 45], wraps: [], edges: [] },
  SSTF: { path: [50, 45, 70, 90, 20], wraps: [], edges: [] },
  SCAN: { path: [50, 70, 90, 100, 45, 20], wraps: [], edges: [100] },
  LOOK: { path: [50, 70, 90, 45, 20], wraps: [], edges: [] },
  'C-SCAN': { path: [50, 70, 90, 100], wraps: [[100, 0]], tail: [0, 20, 45], edges: [0, 100] },
  'C-LOOK': { path: [50, 70, 90], wraps: [[90, 20]], tail: [20, 45], edges: [] },
}

const DEMO_REQUESTS = [20, 45, 70, 90]

export default function AlgoGrid({ selected, onSelect }) {
  return (
    <section aria-label="How the algorithms differ">
      <h2 className="text-lg font-semibold tracking-tight text-ink">
        How do the algorithms differ?
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-subtle">
        Same disk, same requests — six different routes. Click a card to try it with your
        numbers.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(ALGORITHM_INFO).map((info) => {
          const active = selected === info.name
          return (
            <button
              key={info.name}
              type="button"
              onClick={() => onSelect(info.name)}
              aria-pressed={active}
              className={`rounded-xl border p-4 text-left transition-all duration-150 ${
                active
                  ? 'border-head/60 bg-head/[0.06]'
                  : 'border-edge bg-base-900 hover:border-edge-strong hover:bg-base-850'
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className={`num text-sm font-semibold ${active ? 'text-head' : 'text-ink'}`}>
                  {info.name}
                </span>
                {active ? (
                  <span className="num rounded border border-head/40 px-1.5 py-px text-[10px] font-medium text-head">
                    selected
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-subtle">
                {info.tagline}
              </span>
              <MiniDiagram route={ROUTES[info.name]} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

/** The head's route through the demo requests, drawn like a little subway map. */
function MiniDiagram({ route }) {
  const x = (value) => 6 + value * 1.08
  const lane = (index) => 8 + (index % 3) * 7

  const legs = []
  for (let i = 0; i < route.path.length - 1; i += 1) {
    legs.push({ from: route.path[i], to: route.path[i + 1], lane: lane(i), wrap: false })
  }
  ;(route.wraps ?? []).forEach(([from, to], k) => {
    legs.push({ from, to, lane: lane(legs.length + k), wrap: true })
  })
  const tail = route.tail ?? []
  for (let i = 0; i < tail.length - 1; i += 1) {
    legs.push({ from: tail[i], to: tail[i + 1], lane: lane(legs.length), wrap: false })
  }

  return (
    <svg
      viewBox="0 0 120 40"
      className="mt-3 h-14 w-full"
      role="img"
      aria-label="Diagram of the head's route"
    >
      {/* disk */}
      <line x1={x(0)} y1={34} x2={x(100)} y2={34} stroke="var(--color-base-600)" strokeWidth={1.5} />
      {[0, 100].map((edge) => (
        <line
          key={edge}
          x1={x(edge)}
          y1={30}
          x2={x(edge)}
          y2={38}
          stroke={route.edges.includes(edge) ? 'var(--color-boundary)' : 'var(--color-base-600)'}
          strokeWidth={2}
        />
      ))}

      {/* waiting requests */}
      {DEMO_REQUESTS.map((request) => (
        <circle key={request} cx={x(request)} cy={34} r={2.2} fill="var(--color-subtle)" />
      ))}

      {/* route legs */}
      {legs.map((leg, index) => {
        const x1 = x(leg.from)
        const x2 = x(leg.to)
        const y = leg.lane
        const goingRight = x2 >= x1
        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={leg.wrap ? 'var(--color-wrap)' : 'var(--color-head)'}
              strokeWidth={1.6}
              strokeDasharray={leg.wrap ? '3 2.5' : undefined}
              strokeLinecap="round"
            />
            {/* drop from the lane to each stop */}
            <line x1={x1} y1={y} x2={x1} y2={32} stroke="var(--color-base-600)" strokeWidth={0.8} />
            <line x1={x2} y1={y} x2={x2} y2={32} stroke="var(--color-base-600)" strokeWidth={0.8} />
            {/* arrowhead */}
            <polygon
              points={goingRight ? `${x2},${y} ${x2 - 3.4},${y - 1.8} ${x2 - 3.4},${y + 1.8}` : `${x2},${y} ${x2 + 3.4},${y - 1.8} ${x2 + 3.4},${y + 1.8}`}
              fill={leg.wrap ? 'var(--color-wrap)' : 'var(--color-head)'}
            />
            {index === 0 ? <circle cx={x1} cy={y} r={2.4} fill="var(--color-head)" /> : null}
          </g>
        )
      })}
    </svg>
  )
}
