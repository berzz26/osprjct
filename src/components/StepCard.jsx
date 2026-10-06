import { doneSentence, narrateStep, readySentence, upcomingLabel } from '../utils/explain.js'
import { round } from '../utils/metrics.js'

/**
 * The "why" card under the disk. Three lines, plain language:
 * what is next, why the head goes there, and how far that is.
 */
export default function StepCard({ algorithm, input, result, step }) {
  const movements = result?.movements ?? []
  const total = movements.length
  const upcoming = step < total ? movements[step] : null
  const finished = total > 0 && step >= total

  let next, why, distance
  if (total === 0) {
    next = '—'
    why = 'Add at least one request to run the simulation.'
    distance = '—'
  } else if (finished) {
    next = 'Done'
    why = doneSentence({ served: result.requestsServed, total: result.totalMovement })
    distance = `${round(result.totalMovement)} positions`
  } else if (step === 0 && !upcoming) {
    next = '—'
    why = readySentence({ head: input.head, count: input.requests.length })
    distance = '—'
  } else {
    next = upcomingLabel(upcoming)
    why = narrateStep({ algorithm, movement: upcoming, index: step, total })
    distance = `${round(upcoming.distance)} position${upcoming.distance === 1 ? '' : 's'}`
  }

  return (
    <div aria-live="polite" className="rounded-xl border border-edge bg-base-900 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {finished ? 'Status' : 'Next request'}
          </p>
          <p className="num mt-1 text-3xl font-semibold tracking-tight text-head">{next}</p>
        </div>

        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Why?</p>
          <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-ink">{why}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {finished ? 'Travelled' : 'Distance'}
          </p>
          <p className="num mt-1 text-3xl font-semibold tracking-tight text-ink">{distance}</p>
        </div>
      </div>

      {total > 0 ? (
        <p className="num mt-3 border-t border-edge pt-3 text-xs text-muted">
          Step {Math.min(step + (finished ? 0 : 1), total)} of {total}
        </p>
      ) : null}
    </div>
  )
}
