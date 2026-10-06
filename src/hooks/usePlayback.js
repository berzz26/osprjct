import { useCallback, useEffect, useRef, useState } from 'react'

/** Playback speeds, slowest to fastest, in milliseconds per movement. */
export const SPEEDS = [
  { label: 'Slow', ms: 1500 },
  { label: 'Steady', ms: 1000 },
  { label: 'Normal', ms: 650 },
  { label: 'Fast', ms: 380 },
  { label: 'Instant', ms: 140 },
]

/**
 * Drives the step-by-step playback of a simulation result.
 *
 * `step` is the number of movements already completed, so it ranges from 0 to
 * `totalSteps` and indexes directly into `result.movements`.
 *
 * A brand new run resets playback to the finished state, so the dashboard always
 * shows something useful immediately instead of a head parked at cylinder 0.
 */
export function usePlayback({ totalSteps, runId, speedIndex }) {
  const speed = SPEEDS[speedIndex] ?? SPEEDS[2]

  const [trackedRun, setTrackedRun] = useState(runId)
  const [step, setStep] = useState(totalSteps)
  const [playing, setPlaying] = useState(false)
  const frame = useRef(null)

  // Reset when a new result arrives. React's documented way to do this is to
  // adjust state during render rather than in an effect, which avoids an extra
  // render pass showing stale playback position.
  if (trackedRun !== runId) {
    setTrackedRun(runId)
    setStep(totalSteps)
    setPlaying(false)
  }

  const play = useCallback(() => {
    setStep((current) => (current >= totalSteps ? 0 : current))
    setPlaying(true)
  }, [totalSteps])

  const pause = useCallback(() => setPlaying(false), [])

  const replay = useCallback(() => {
    setStep(0)
    setPlaying(true)
  }, [])

  const reset = useCallback(() => {
    setPlaying(false)
    setStep(totalSteps)
  }, [totalSteps])

  const advance = useCallback(() => {
    setStep((current) => {
      const next = Math.min(current + 1, totalSteps)
      if (next >= totalSteps) setPlaying(false)
      return next
    })
  }, [totalSteps])

  const retreat = useCallback(() => {
    setPlaying(false)
    setStep((current) => Math.max(current - 1, 0))
  }, [])

  const seek = useCallback(
    (target) => {
      setPlaying(false)
      setStep(Math.max(0, Math.min(target, totalSteps)))
    },
    [totalSteps],
  )

  // Advance one movement per tick, and stop on the final step.
  useEffect(() => {
    if (!playing || step >= totalSteps) return undefined

    frame.current = setTimeout(() => {
      setStep((current) => {
        const next = current + 1
        if (next >= totalSteps) setPlaying(false)
        return next
      })
    }, speed.ms)

    return () => clearTimeout(frame.current)
  }, [playing, step, totalSteps, speed.ms])

  return {
    step,
    playing,
    atStart: step === 0,
    atEnd: step >= totalSteps,
    speedMs: speed.ms,
    speedLabel: speed.label,
    play,
    pause,
    replay,
    reset,
    advance,
    retreat,
    seek,
  }
}
