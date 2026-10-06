import { forwardRef } from 'react'
import { round } from '../utils/metrics.js'

/**
 * Compare mode: one table, one bar chart, one honest disclaimer.
 * Every row was computed from the same input.
 */
const ComparePanel = forwardRef(function ComparePanel({ results, onSelect, onClose }, ref) {
  if (!results || results.length === 0) return null

  const best = Math.min(...results.map((r) => r.totalMovement))
  const worst = Math.max(...results.map((r) => r.totalMovement), 1)
  const ranked = [...results].sort((a, b) => a.totalMovement - b.totalMovement)

  return (
    <section ref={ref} aria-label="Compare algorithms" className="card scroll-mt-24 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Compare algorithms</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-subtle">
            All six ran on your exact input. Lower head movement generally means less time
            spent moving the disk head.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="num rounded-lg border border-edge-strong bg-base-850 px-3 py-2 text-sm font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink"
        >
          Hide comparison
        </button>
      </div>

      {/* table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="border-b border-edge text-left">
              <th scope="col" className="py-2 pr-4 text-xs font-medium uppercase tracking-wider text-muted">
                Algorithm
              </th>
              <th scope="col" className="py-2 text-right text-xs font-medium uppercase tracking-wider text-muted">
                Total movement
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((result) => {
              const isBest = result.totalMovement === best
              return (
                <tr
                  key={result.id}
                  className={`border-b border-edge/60 last:border-0 ${isBest ? 'bg-served/[0.06]' : ''}`}
                >
                  <td className="py-2.5 pr-4">
                    <button
                      type="button"
                      onClick={() => onSelect(result.id)}
                      className="group flex items-center gap-2"
                      title={`Run ${result.id} with these inputs`}
                    >
                      <span className="num text-[15px] font-semibold text-ink group-hover:text-head">
                        {result.id}
                      </span>
                      {isBest ? (
                        <span className="num rounded border border-served/40 bg-served/10 px-1.5 py-px text-[11px] font-medium text-served">
                          smallest
                        </span>
                      ) : null}
                    </button>
                  </td>
                  <td className="num py-2.5 text-right text-[15px] font-semibold text-subtle">
                    {round(result.totalMovement)}{' '}
                    <span className="text-xs font-normal text-muted">positions</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* bars */}
      <ul className="mt-5 space-y-2.5">
        {ranked.map((result) => {
          const pct = (result.totalMovement / worst) * 100
          const isBest = result.totalMovement === best
          return (
            <li key={`bar-${result.id}`}>
              <button type="button" onClick={() => onSelect(result.id)} className="group block w-full text-left">
                <span className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="num text-xs font-semibold text-subtle group-hover:text-head">
                    {result.id}
                  </span>
                  <span className="num text-xs text-muted">
                    {round(result.totalMovement)} positions
                  </span>
                </span>
                <span className="block h-3 overflow-hidden rounded-full bg-base-800">
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ${
                      isBest ? 'bg-served' : 'bg-base-600 group-hover:bg-subtle'
                    }`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 border-t border-edge pt-3 text-[13px] leading-relaxed text-muted">
        The smallest number is not automatically the best algorithm. A method with slightly more
        movement can still be the right choice if it treats every request fairly or avoids
        leaving distant requests waiting. Click any row to run it.
      </p>
    </section>
  )
})

export default ComparePanel
