import { useMemo, useState } from 'react'
import { KIND } from '../algorithms/index.js'
import { round } from '../utils/metrics.js'

/**
 * 2D Disk Scheduling Trajectory Graph (Time-Series / Cylinder vs. Step)
 *
 * Visualizes the disk head path descending step-by-step from top to bottom
 * across cylinder positions with vertical grid lines, exactly like classic
 * textbook diagrams and the user's reference image.
 */
export default function DiskGraphView({
  config,
  result,
  step = 0,
  playback,
  onSeek,
  large = false,
  showFullGhost = true,
}) {
  const { diskSize, head, requests } = config
  const lastCylinder = Math.max(diskSize - 1, 1)

  const [spacingMode, setSpacingMode] = useState('columns') // 'columns' | 'proportional'
  const [showDistances, setShowDistances] = useState(true)
  const [hoveredStep, setHoveredStep] = useState(null)

  const movements = result?.movements ?? []
  const totalSteps = movements.length
  const currentStep = Math.min(step, totalSteps)

  const isPlaying = playback?.playing ?? false
  const isAtEnd = playback?.atEnd ?? (currentStep >= totalSteps)
  const isAtStart = playback?.atStart ?? (currentStep === 0)

  // Quick action handler for the prominent Start/Play button
  const handleStartPlay = () => {
    if (!playback) return
    if (isPlaying) {
      playback.pause()
    } else if (isAtEnd) {
      playback.replay()
    } else {
      playback.play()
    }
  }

  // Collect all unique cylinder landmarks (boundaries 0, max, start head, and all request cylinders)
  const landmarks = useMemo(() => {
    const set = new Set([0, head, lastCylinder, ...requests])
    // Also include any intermediate targets like boundaries or wraps
    for (const m of movements) {
      set.add(m.from)
      set.add(m.to)
    }
    const sorted = Array.from(set).sort((a, b) => a - b)
    return sorted
  }, [head, lastCylinder, requests, movements])

  // Count requests at each cylinder
  const requestCounts = useMemo(() => {
    const counts = new Map()
    for (const r of requests) {
      counts.set(r, (counts.get(r) ?? 0) + 1)
    }
    return counts
  }, [requests])

  // Build the list of trajectory vertices: Step 0 (start head), Step 1 (movement 0 target), etc.
  const nodes = useMemo(() => {
    const list = [
      {
        stepIndex: 0,
        cylinder: head,
        kind: 'start',
        distance: 0,
        isStart: true,
      },
    ]

    for (let i = 0; i < movements.length; i++) {
      const m = movements[i]
      list.push({
        stepIndex: i + 1,
        cylinder: m.to,
        fromCylinder: m.from,
        kind: m.kind,
        distance: m.distance,
        isStart: false,
      })
    }
    return list
  }, [head, movements])

  // SVG dimensions and coordinate mapping
  const paddingLeft = large ? 72 : 56
  const paddingRight = large ? 48 : 36
  const paddingTop = large ? 48 : 42
  const rowHeight = large ? 46 : 38
  const graphWidth = large ? 860 : 720
  const graphHeight = paddingTop + Math.max(nodes.length, 1) * rowHeight + 30

  // Calculate X coordinate for any cylinder
  const getX = (cyl) => {
    const availableWidth = graphWidth - paddingLeft - paddingRight
    if (spacingMode === 'proportional') {
      const pct = cyl / lastCylinder
      return paddingLeft + pct * availableWidth
    }
    // Columns mode: map cylinder index among landmarks
    const index = landmarks.indexOf(cyl)
    if (index === -1) {
      const pct = cyl / lastCylinder
      return paddingLeft + pct * availableWidth
    }
    const colStep = availableWidth / Math.max(landmarks.length - 1, 1)
    return paddingLeft + index * colStep
  }

  // Calculate Y coordinate for a step index
  const getY = (stepIndex) => paddingTop + stepIndex * rowHeight

  // Current head position coordinates
  const currentPos = useMemo(() => {
    if (currentStep === 0) {
      return { x: getX(head), y: getY(0), cylinder: head }
    }
    const node = nodes[currentStep] ?? nodes[nodes.length - 1]
    return { x: getX(node.cylinder), y: getY(node.stepIndex), cylinder: node.cylinder }
  }, [currentStep, head, nodes, spacingMode, landmarks])

  // Generate path segments
  const segments = useMemo(() => {
    const segs = []
    for (let i = 0; i < nodes.length - 1; i++) {
      const fromNode = nodes[i]
      const toNode = nodes[i + 1]
      const x1 = getX(fromNode.cylinder)
      const y1 = getY(fromNode.stepIndex)
      const x2 = getX(toNode.cylinder)
      const y2 = getY(toNode.stepIndex)
      const isVisited = i < currentStep
      const isCurrentLeg = i === currentStep - 1

      segs.push({
        stepIndex: i + 1,
        fromNode,
        toNode,
        x1,
        y1,
        x2,
        y2,
        isVisited,
        isCurrentLeg,
        kind: toNode.kind,
        distance: toNode.distance,
      })
    }
    return segs
  }, [nodes, currentStep, spacingMode, landmarks])

  // Calculation formula steps
  const mathFormula = useMemo(() => {
    if (movements.length === 0) return null
    const parts = movements.map((m) => `|${m.from} - ${m.to}|`)
    const values = movements.map((m) => m.distance)
    return {
      formula: parts.join(' + '),
      expanded: values.join(' + '),
      total: result?.totalMovement ?? 0,
      avg: result?.averageSeek ?? 0,
    }
  }, [movements, result])

  return (
    <div className="w-full select-none">
      {/* Controls Bar above graph with Quick Start Button */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Playback Quick Start Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Start / Play / Pause Button */}
          <button
            type="button"
            onClick={handleStartPlay}
            disabled={totalSteps === 0}
            className={`num flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-all shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-amber-500/20 hover:bg-amber-400'
                : 'bg-head text-black shadow-head/30 hover:brightness-110 hover:shadow-head/50'
            }`}
            title={isPlaying ? 'Pause animation' : isAtEnd ? 'Restart & play simulation' : 'Start simulation'}
          >
            {isPlaying ? (
              <>
                <span className="text-sm">⏸</span> Pause
              </>
            ) : isAtEnd ? (
              <>
                <span className="text-sm">↺</span> Replay
              </>
            ) : isAtStart ? (
              <>
                <span className="text-sm">▶</span> Start Simulation
              </>
            ) : (
              <>
                <span className="text-sm">▶</span> Resume
              </>
            )}
          </button>

          {/* Step Back button */}
          <button
            type="button"
            onClick={() => playback?.retreat()}
            disabled={!playback || isAtStart || totalSteps === 0}
            className="num flex items-center gap-1 rounded-lg border border-edge-strong bg-base-850 px-2.5 py-2 font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous step (Step Back)"
          >
            <span>⏮</span> Prev
          </button>

          {/* Step Forward button */}
          <button
            type="button"
            onClick={() => playback?.advance()}
            disabled={!playback || isAtEnd || totalSteps === 0}
            className="num flex items-center gap-1 rounded-lg border border-edge-strong bg-base-850 px-2.5 py-2 font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next step (Step Forward)"
          >
            Next <span>⏭</span>
          </button>

          {/* Replay reset button */}
          <button
            type="button"
            onClick={() => playback?.replay()}
            disabled={!playback || totalSteps === 0}
            className="num flex items-center gap-1 rounded-lg border border-edge-strong bg-base-850 px-2.5 py-2 font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            title="Restart from beginning"
          >
            <span>↺</span> Reset
          </button>

          {/* Step Counter Badge */}
          <span className="num ml-1 rounded-md border border-edge/80 bg-base-900 px-2 py-1 text-[11px] font-medium text-muted">
            Step <span className="font-bold text-amber-400">{currentStep}</span> / {totalSteps}
          </span>
        </div>

        {/* Display Settings: Scale Mode & Distance Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted">Scale:</span>
            <div className="inline-flex rounded-lg border border-edge-strong bg-base-850 p-0.5">
              <button
                type="button"
                onClick={() => setSpacingMode('columns')}
                className={`num rounded-md px-2.5 py-1 font-medium transition-colors ${
                  spacingMode === 'columns'
                    ? 'bg-base-700 text-ink shadow-xs'
                    : 'text-muted hover:text-subtle'
                }`}
                title="Equally spaced vertical columns for each cylinder request (Textbook style)"
              >
                Textbook Columns
              </button>
              <button
                type="button"
                onClick={() => setSpacingMode('proportional')}
                className={`num rounded-md px-2.5 py-1 font-medium transition-colors ${
                  spacingMode === 'proportional'
                    ? 'bg-base-700 text-ink shadow-xs'
                    : 'text-muted hover:text-subtle'
                }`}
                title="Proportional spacing based on physical cylinder numbers (0 to disk max)"
              >
                Physical Proportions
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-1.5 text-muted hover:text-subtle">
            <input
              type="checkbox"
              checked={showDistances}
              onChange={(e) => setShowDistances(e.target.checked)}
              className="rounded border-edge-strong bg-base-850 text-head focus:ring-0"
            />
            <span>Show seek distance (Δ)</span>
          </label>
        </div>
      </div>

      {/* Main SVG Graph Container */}
      <div className="relative overflow-x-auto rounded-xl border border-edge bg-base-950/80 p-2 shadow-inner backdrop-blur-xs scrollbar-thin">
        <svg
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="mx-auto block w-full min-w-[620px]"
          style={{ maxHeight: large ? '640px' : '520px' }}
        >
          <defs>
            {/* Glow filter for active/visited lines */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-head" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="headPulse" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* 1. Vertical Guideline Grid Lines (Dropping from each cylinder at top) */}
          {landmarks.map((cyl) => {
            const x = getX(cyl)
            const isStart = cyl === head
            const isCurrentHead = currentPos.cylinder === cyl
            const isRequest = requestCounts.has(cyl)
            const isBoundary = cyl === 0 || cyl === lastCylinder

            return (
              <g key={`grid-col-${cyl}`} className="transition-all duration-200">
                {/* Vertical Guideline */}
                <line
                  x1={x}
                  y1={paddingTop - 6}
                  x2={x}
                  y2={graphHeight - 16}
                  stroke={
                    isCurrentHead
                      ? 'rgba(251, 191, 36, 0.4)'
                      : isStart
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'rgba(255, 255, 255, 0.08)'
                  }
                  strokeWidth={isCurrentHead ? '1.75' : '1'}
                  strokeDasharray={isBoundary && !isRequest && !isStart ? '3 3' : 'none'}
                />

                {/* Column header track number on top (Textbook red/coral style) */}
                <text
                  x={x}
                  y={paddingTop - 14}
                  textAnchor="middle"
                  className={`num text-xs font-bold transition-colors ${
                    isCurrentHead
                      ? 'fill-amber-400 font-extrabold'
                      : isStart
                        ? 'fill-sky-400'
                        : isRequest
                          ? 'fill-rose-400'
                          : 'fill-slate-400'
                  }`}
                  style={{
                    fontSize: large ? '13px' : '11.5px',
                    filter: isCurrentHead ? 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' : 'none',
                  }}
                >
                  {cyl}
                </text>

                {/* Duplicate request badge */}
                {requestCounts.get(cyl) > 1 ? (
                  <text
                    x={x + 10}
                    y={paddingTop - 22}
                    textAnchor="start"
                    className="num fill-amber-300/80 text-[9px] font-semibold"
                  >
                    ×{requestCounts.get(cyl)}
                  </text>
                ) : null}
              </g>
            )
          })}

          {/* 2. Step horizontal row guide lines and step indices on the left */}
          {nodes.map((node, i) => {
            const y = getY(i)
            const isVisited = i <= currentStep
            const isCurrent = i === currentStep

            return (
              <g key={`step-row-${i}`} className="transition-opacity duration-200">
                {/* Horizontal row line */}
                <line
                  x1={paddingLeft - 20}
                  y1={y}
                  x2={graphWidth - paddingRight + 12}
                  y2={y}
                  stroke={isCurrent ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.04)'}
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />

                {/* Row label on left */}
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className={`num text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? 'fill-amber-400 font-bold'
                      : isVisited
                        ? 'fill-sky-300/70'
                        : 'fill-slate-600'
                  }`}
                >
                  {i === 0 ? 'Start' : `S${i}`}
                </text>
              </g>
            )
          })}

          {/* 3. Ghost Path (Future planned movements) */}
          {showFullGhost && (
            <g opacity="0.35">
              {segments.map((seg, i) => {
                if (seg.isVisited) return null
                const isWrap = seg.kind === KIND.WRAP
                const isBoundary = seg.kind === KIND.BOUNDARY
                return (
                  <line
                    key={`ghost-seg-${i}`}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={
                      isWrap ? '#c084fc' : isBoundary ? '#fb7185' : '#60a5fa'
                    }
                    strokeWidth="1.5"
                    strokeDasharray={isWrap ? '4 4' : isBoundary ? '5 3' : '3 3'}
                  />
                )
              })}
            </g>
          )}

          {/* 4. Active & Visited Trajectory Lines */}
          <g>
            {segments.map((seg, i) => {
              if (!seg.isVisited) return null
              const isWrap = seg.kind === KIND.WRAP
              const isBoundary = seg.kind === KIND.BOUNDARY
              const midX = (seg.x1 + seg.x2) / 2
              const midY = (seg.y1 + seg.y2) / 2

              return (
                <g key={`visited-seg-${i}`} className="cursor-pointer" onClick={() => onSeek?.(seg.stepIndex)}>
                  {/* Glowing main path line */}
                  <line
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={
                      isWrap
                        ? '#c084fc'
                        : isBoundary
                          ? '#fb7185'
                          : '#38bdf8'
                    }
                    strokeWidth={seg.isCurrentLeg ? '3.5' : '2.5'}
                    strokeLinecap="round"
                    strokeDasharray={isWrap ? '5 4' : isBoundary ? '6 4' : 'none'}
                    filter={seg.isCurrentLeg ? 'url(#glow-cyan)' : undefined}
                    className="transition-all duration-300"
                  />

                  {/* Direction Arrow on line segment */}
                  {seg.distance > 0 && (
                    <circle
                      cx={midX}
                      cy={midY}
                      r="2"
                      fill={isWrap ? '#e9d5ff' : '#bae6fd'}
                    />
                  )}

                  {/* Leg Seek Distance Badge (e.g. Δ 45) */}
                  {showDistances && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-16"
                        y="-9"
                        width="32"
                        height="18"
                        rx="9"
                        fill="#090d16"
                        stroke={isWrap ? '#7e22ce' : isBoundary ? '#9f1239' : '#0369a1'}
                        strokeWidth="1"
                        className="shadow-sm"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        className="num fill-slate-200 text-[10px] font-bold"
                      >
                        {seg.distance}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* 5. Vertex Nodes (Points on the trajectory) */}
          {nodes.map((node, i) => {
            const x = getX(node.cylinder)
            const y = getY(node.stepIndex)
            const isVisited = i <= currentStep
            const isCurrent = i === currentStep
            const isHovered = hoveredStep === i
            const isWrap = node.kind === KIND.WRAP
            const isBoundary = node.kind === KIND.BOUNDARY

            return (
              <g
                key={`node-${i}`}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSeek?.(i)}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Hit area */}
                <circle cx="0" cy="0" r="16" fill="transparent" />

                {/* Visited / Future Node Circles */}
                {node.isStart ? (
                  // Starting Head Node (Step 0)
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r={isCurrent ? '7' : '5.5'}
                      fill="#38bdf8"
                      stroke="#0284c7"
                      strokeWidth="2"
                      filter="url(#glow-cyan)"
                    />
                    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                  </g>
                ) : isVisited ? (
                  // Serviced / Visited Node
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r={isCurrent ? '6.5' : isHovered ? '6' : '5'}
                      fill={
                        isWrap ? '#a855f7' : isBoundary ? '#f43f5e' : '#34d399'
                      }
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                      filter="drop-shadow(0 0 3px rgba(52,211,153,0.5))"
                    />
                    <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
                  </g>
                ) : (
                  // Future Unvisited Node
                  <circle
                    cx="0"
                    cy="0"
                    r="3.5"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Cylinder label beside node on hover or current */}
                {(isHovered || isCurrent) && (
                  <g transform={`translate(${x > graphWidth - 100 ? -48 : 12}, 4)`}>
                    <rect
                      x="-4"
                      y="-14"
                      width="42"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      stroke={isCurrent ? '#fbbf24' : '#38bdf8'}
                      strokeWidth="1"
                    />
                    <text
                      x="17"
                      y="-1"
                      textAnchor="middle"
                      className={`num text-[10px] font-bold ${
                        isCurrent ? 'fill-amber-300' : 'fill-sky-300'
                      }`}
                    >
                      {node.cylinder}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* 6. Active Animated Head Indicator */}
          <g
            transform={`translate(${currentPos.x}, ${currentPos.y})`}
            className="pointer-events-none transition-all duration-300 ease-out"
          >
            {/* Animated Pulse Waves */}
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              opacity="0.75"
              className="animate-ping"
            />
            <circle
              cx="0"
              cy="0"
              r="9"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              filter="url(#glow-head)"
            />

            {/* Glowing Diamond Head Marker (Matches User Screenshot) */}
            <rect
              x="-6"
              y="-6"
              width="12"
              height="12"
              fill="url(#headPulse)"
              stroke="#fffbeb"
              strokeWidth="1.5"
              transform="rotate(45)"
              className="shadow-lg"
              filter="url(#glow-head)"
            />

            {/* "HEAD: [pos]" Pill Tag */}
            <g transform="translate(0, 22)">
              <rect
                x="-36"
                y="-10"
                width="72"
                height="20"
                rx="6"
                fill="#07080b"
                stroke="#fbbf24"
                strokeWidth="1.5"
                className="shadow-md"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                className="num fill-amber-300 text-[11px] font-extrabold tracking-wide"
              >
                HEAD: {currentPos.cylinder}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Legend & Details */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 text-xs text-subtle">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-sky-400" /> Start Head ({head})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-served" /> Serviced Request
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 bg-head shadow-xs shadow-head/50" /> Current Head
          </span>
          {result?.movements.some((m) => m.kind === KIND.BOUNDARY) && (
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-boundary" /> Boundary Hit (0 / Max)
            </span>
          )}
          {result?.movements.some((m) => m.kind === KIND.WRAP) && (
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-wrap" /> Circular Wrap
            </span>
          )}
        </div>

        <span className="text-muted">
          Click any step point or number to jump animation
        </span>
      </div>

      {/* Math Calculation Ledger (Silberschatz / OS Exam Format) */}
      {mathFormula && (
        <div className="mt-4 rounded-xl border border-edge bg-base-900/90 p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge/60 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Seek Distance Calculation Breakdown
            </span>
            <span className="num text-xs font-semibold text-served">
              Average Seek: {round(mathFormula.avg)} cylinders
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 overflow-x-auto text-xs font-mono scrollbar-thin">
            <div className="whitespace-nowrap text-subtle">
              <span className="text-muted">Formula: </span>
              <span className="text-sky-300/90">{mathFormula.formula}</span>
            </div>
            <div className="whitespace-nowrap text-ink">
              <span className="text-muted">Values:  </span>
              <span className="text-emerald-400">{mathFormula.expanded}</span>
              <span className="font-bold text-amber-400"> = {round(mathFormula.total)} cylinders</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
