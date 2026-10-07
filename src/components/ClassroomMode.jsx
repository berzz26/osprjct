import { useEffect, useState } from 'react'
import { ALGORITHM_INFO } from '../data/algorithmInfo.js'
import { narrateStep, upcomingLabel, waitingRequests } from '../utils/explain.js'
import { round } from '../utils/metrics.js'
import DiskGraphView from './DiskGraphView.jsx'
import DiskView from './DiskView.jsx'
import Transport from './Transport.jsx'

/**
 * Presentation mode: a full-screen, distraction-free view for demonstrating
 * to the class. Big algorithm name, big numbers, the current request, and the
 * reason for the next move — nothing else.
 */
export default function ClassroomMode({
  algorithm,
  input,
  result,
  step,
  playback,
  speedPreset,
  onSpeedPreset,
  onExit,
}) {
  const [viewMode, setViewMode] = useState('graph') // 'graph' | 'track'
  const info = ALGORITHM_INFO[algorithm]
  const movements = result?.movements ?? []
  const total = movements.length
  const upcoming = step < total ? movements[step] : null
  const finished = total > 0 && step >= total

  const current = step > 0 ? movements[step - 1].to : input.head
  const waiting = waitingRequests({ algorithm, input, result, step })
  const travelled = movements.slice(0, step).reduce((sum, m) => sum + m.distance, 0)

  // Esc leaves presentation mode.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-base-950" role="dialog" aria-modal="true" aria-label="Presentation mode">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 py-6 sm:px-10 sm:py-8">
        {/* top bar */}
        <div className="flex items-center justify-between gap-4">
          <p className="num text-xs uppercase tracking-[0.2em] text-muted">Presentation mode</p>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-edge-strong bg-base-850 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`num rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'graph' ? 'bg-head text-black' : 'text-muted hover:text-ink'
                }`}
              >
                📈 2D Trajectory
              </button>
              <button
                type="button"
                onClick={() => setViewMode('track')}
                className={`num rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'track' ? 'bg-head text-black' : 'text-muted hover:text-ink'
                }`}
              >
                📏 1D Disk Track
              </button>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="num rounded-lg border border-edge-strong bg-base-850 px-4 py-2 text-sm font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink"
            >
              Exit ✕
            </button>
          </div>
        </div>

        {/* algorithm */}
        <h2 className="num mt-6 text-center text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          {algorithm}
        </h2>
        <p className="mt-2 text-center text-lg text-subtle">{info?.fullName}</p>

        {/* disk visualizer */}
        <div className="card mt-8 p-5 sm:p-8">
          {viewMode === 'graph' ? (
            <DiskGraphView
              config={input}
              result={result}
              step={step}
              playback={playback}
              onSeek={playback.seek}
              large
            />
          ) : (
            <DiskView config={input} result={result} step={step} large />
          )}
        </div>

        {/* current position */}
        <p className="mt-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Current position
        </p>
        <p className="num mt-1 text-center text-7xl font-semibold tracking-tight text-head sm:text-8xl">
          {current}
        </p>

        {/* waiting requests */}
        <p className="mt-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Waiting requests
        </p>
        {waiting.length === 0 ? (
          <p className="num mt-3 text-center text-2xl text-served">none — all visited ✓</p>
        ) : (
          <div className="num mt-3 flex flex-wrap items-end justify-center gap-2">
            {waiting.slice(0, 10).map((request) => {
              const isNext = upcoming?.kind === 'request' && upcoming.to === request.value
              return (
                <span key={request.value} className="flex flex-col items-center gap-1">
                  {isNext ? (
                    <span className="text-xs font-semibold text-head">
                      ↑ NEXT: {request.value}
                    </span>
                  ) : (
                    <span className="h-4" aria-hidden="true" />
                  )}
                  <span
                    className={`rounded-xl border px-4 py-2 text-2xl font-semibold ${
                      isNext
                        ? 'border-head/70 bg-head/10 text-head'
                        : 'border-edge-strong text-subtle'
                    }`}
                  >
                    {request.value}
                  </span>
                </span>
              )
            })}
            {waiting.length > 10 ? (
              <span className="num text-lg text-muted">+{waiting.length - 10} more</span>
            ) : null}
          </div>
        )}

        {/* why */}
        <div className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-edge bg-base-900 p-5 text-center sm:p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Why?</p>
          <p className="mt-2 text-xl leading-relaxed text-ink">
            {finished
              ? `All ${result.requestsServed} requests visited.`
              : `“${narrateStep({ algorithm, movement: upcoming, index: step, total })}”`}
          </p>

          {!finished && upcoming ? (
            <>
              <p className="num mt-4 text-4xl font-semibold text-ink">
                {step > 0 ? movements[step - 1].to : input.head}
                <span className="mx-3 text-head">→</span>
                {upcomingLabel(upcoming)}
              </p>
              <p className="num mt-2 text-lg text-subtle">
                Moved: {round(upcoming.distance)} position{upcoming.distance === 1 ? '' : 's'}
                <span className="mx-2 text-base-600">·</span>
                Total so far: {round(travelled)} positions
              </p>
            </>
          ) : (
            <p className="num mt-4 text-2xl text-served">
              Total movement: {round(result.totalMovement)} positions
            </p>
          )}
        </div>

        {/* transport */}
        <div className="mx-auto mt-8 w-full max-w-xl">
          <Transport
            playback={playback}
            disabled={total === 0}
            speedPreset={speedPreset}
            onSpeedPreset={onSpeedPreset}
            totalSteps={total}
          />
          <p className="num mt-3 text-center text-sm text-muted">
            Step {Math.min(step + (finished ? 0 : 1), Math.max(total, 1))} of {total}
          </p>
        </div>
      </div>
    </div>
  )
}
