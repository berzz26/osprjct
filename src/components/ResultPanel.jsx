import { buildResult } from '../utils/metrics.js'
import HelpTip from './HelpTip.jsx'

/**
 * The Result card: exactly three numbers, each with a one-line explanation.
 * Anything advanced lives behind the optional Details disclosure.
 */
export default function ResultPanel({ result, requestCount, compareOpen, onToggleCompare }) {
  if (!result) return null
  const { headline, details } = buildResult(result, requestCount)

  return (
    <section aria-label="Result" className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Result</h2>
          <p className="mt-1 text-sm text-subtle">
            Three numbers tell the whole story.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleCompare}
          aria-expanded={compareOpen}
          className={`num rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            compareOpen
              ? 'border-pending/50 bg-pending/10 text-pending'
              : 'border-edge-strong bg-base-850 text-subtle hover:border-base-600 hover:text-ink'
          }`}
        >
          {compareOpen ? 'Hide comparison' : 'Compare Algorithms'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {headline.map((metric) => (
          <div
            key={metric.key}
            className={`rounded-xl border px-4 py-4 ${
              metric.key === 'total'
                ? 'border-head/30 bg-head/[0.05]'
                : 'border-edge bg-base-850'
            }`}
          >
            <p className="flex items-center text-[13px] font-medium text-muted">
              {metric.label}
              {metric.key === 'total' ? (
                <HelpTip label="head movement">
                  The distance the disk head travels while servicing requests.
                </HelpTip>
              ) : null}
            </p>
            <p
              className={`num mt-1.5 text-4xl font-semibold tracking-tight ${
                metric.key === 'total' ? 'text-head' : 'text-ink'
              }`}
            >
              {metric.value}
            </p>
            <p className="num mt-1 text-[13px] text-muted">{metric.unit}</p>
            <p className="mt-2 border-t border-edge pt-2 text-[13px] leading-relaxed text-subtle">
              {metric.help}
            </p>
          </div>
        ))}
      </div>

      <details className="group mt-3 rounded-lg border border-edge bg-base-850 px-4 py-3">
        <summary className="cursor-pointer list-none text-sm font-medium text-subtle transition-colors hover:text-ink">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
          Details
          <span className="ml-2 text-xs font-normal text-muted">optional, for the curious</span>
        </summary>
        <dl className="mt-3 space-y-2 border-t border-edge pt-3">
          {details.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <dt className="text-muted">{row.label}</dt>
              <dd className="num font-medium text-subtle">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  )
}
