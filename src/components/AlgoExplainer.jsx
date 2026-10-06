import { ALGORITHM_INFO, HDD_NOTE } from '../data/algorithmInfo.js'
import { narrateStep, upcomingLabel, waitingRequests } from '../utils/explain.js'
import { round } from '../utils/metrics.js'

/**
 * The educational card for the selected algorithm: definition, how it works,
 * and — most importantly — a worked example using the user's own numbers at
 * the current animation step.
 */
export default function AlgoExplainer({ algorithm, input, result, step }) {
  const info = ALGORITHM_INFO[algorithm]
  if (!info) return null

  const movements = result?.movements ?? []
  const upcoming = step < movements.length ? movements[step] : null
  const waiting = result ? waitingRequests({ algorithm, input, result, step }) : []
  const shown = waiting.slice(0, 9)
  const hidden = waiting.length - shown.length

  return (
    <section aria-label={`About ${algorithm}`} className="card p-5 sm:p-6">
      <p className="num text-xs font-semibold uppercase tracking-[0.16em] text-head">
        {algorithm}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
        “{info.fullName}”
      </h2>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Definition</h3>
          <p className="mt-1.5 border-l-2 border-head/60 bg-head/[0.04] py-1 pl-3 text-[15px] leading-relaxed text-ink">
            {info.definition}
          </p>

          <h3 className="mt-4 text-sm font-semibold text-ink">How it works</h3>
          <ol className="mt-1.5 space-y-1.5">
            {info.how.map((line, index) => (
              <li key={index} className="flex gap-2.5 text-[15px] leading-relaxed text-subtle">
                <span className="num mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-base-800 text-[11px] font-semibold text-muted">
                  {index + 1}
                </span>
                {line}
              </li>
            ))}
          </ol>

          {info.analogy ? (
            <p className="mt-3 rounded-lg border border-edge bg-base-850 px-3.5 py-2.5 text-sm leading-relaxed text-subtle">
              {info.analogy}
            </p>
          ) : null}

          <p className="mt-3 text-sm text-muted">
            <span className="font-medium text-subtle">Tradeoff: </span>
            {info.tradeoff}
          </p>
        </div>

        {/* live worked example */}
        <div className="rounded-xl border border-edge bg-base-850 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-ink">Example, with your numbers</h3>

          {!result || movements.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Enter at least one request to see {algorithm} work through it here.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="text-sm text-muted">
                  Current position:{' '}
                  <span className="num text-lg font-semibold text-ink">
                    {step > 0 ? movements[step - 1].to : input.head}
                  </span>
                </p>
                {upcoming ? (
                  <p className="text-sm text-muted">
                    Next:{' '}
                    <span className="num text-lg font-semibold text-head">
                      {upcomingLabel(upcoming)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm font-medium text-served">Finished ✓</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Waiting requests
                </p>
                {shown.length === 0 ? (
                  <p className="num mt-1.5 text-sm text-served">none — everything is visited</p>
                ) : (
                  <p className="num mt-1.5 flex flex-wrap gap-1.5">
                    {shown.map((request) => {
                      const isNext =
                        upcoming?.kind === 'request' && upcoming.to === request.value
                      return (
                        <span
                          key={request.value}
                          className={`rounded-md border px-2 py-1 text-sm font-semibold ${
                            isNext
                              ? 'border-head/60 bg-head/10 text-head'
                              : 'border-edge-strong text-subtle'
                          }`}
                        >
                          {request.value}
                          {request.count > 1 ? (
                            <span className="text-[11px] text-muted"> ×{request.count}</span>
                          ) : null}
                        </span>
                      )
                    })}
                    {hidden > 0 ? (
                      <span className="num rounded-md border border-edge-strong px-2 py-1 text-sm text-muted">
                        +{hidden} more
                      </span>
                    ) : null}
                  </p>
                )}
              </div>

              {upcoming ? (
                <div className="rounded-lg bg-base-900 px-3.5 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    Therefore
                  </p>
                  <p className="num mt-1 text-lg font-semibold text-ink">
                    {step > 0 ? movements[step - 1].to : input.head} → {upcoming.to}
                    <span className="ml-2 text-sm font-normal text-muted">
                      ({round(upcoming.distance)} position{upcoming.distance === 1 ? '' : 's'})
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                    <span className="font-medium text-ink">Why? </span>
                    {narrateStep({ algorithm, movement: upcoming, index: step, total: movements.length })}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 border-t border-edge pt-3 text-xs leading-relaxed text-muted">
        {HDD_NOTE}
      </p>
    </section>
  )
}
