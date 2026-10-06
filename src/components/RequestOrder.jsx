/**
 * "Order of requests" — the sequence the head visited, in large readable
 * numbers. Clicking a number jumps the animation to that point.
 */
export default function RequestOrder({ result, step, onJump }) {
  if (!result || result.movements.length === 0) return null

  // The sequence collapses zero-length legs, so remember which animation step
  // produced each number. Clicking jumps to exactly that step.
  const stepForEntry = [0]
  result.movements.forEach((movement, index) => {
    if (movement.to !== result.sequence[stepForEntry.length - 1]) {
      stepForEntry.push(index + 1)
    }
  })

  let currentEntry = 0
  stepForEntry.forEach((entryStep, entryIndex) => {
    if (entryStep <= step) currentEntry = entryIndex
  })

  return (
    <section aria-label="Order of requests" className="card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-ink">Order of requests</h2>
      <p className="mt-1 text-sm text-subtle">
        The order the head visited each position{' '}
        <span className="text-muted">(also called the seek sequence)</span> — click any number
        to jump there.
      </p>

      <ol className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-3">
        {result.sequence.map((value, index) => {
          const reached = stepForEntry[index] <= step
          const isCurrent = index === currentEntry
          return (
            <li key={`${value}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden="true" className="px-0.5 text-lg text-base-600">
                  →
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onJump(stepForEntry[index])}
                title={index === 0 ? `Start: position ${value}` : `Jump to position ${value}`}
                className={`num rounded-lg border px-3 py-1.5 text-xl font-semibold transition-all duration-150 ${
                  isCurrent
                    ? 'border-head/60 bg-head/10 text-head'
                    : reached
                      ? 'border-served/30 bg-served/[0.07] text-served hover:border-served/60'
                      : 'border-edge-strong bg-base-850 text-muted hover:border-base-600 hover:text-subtle'
                }`}
              >
                {value}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
