import { ALGORITHM_IDS, ALGORITHM_INFO } from '../data/algorithmInfo.js'
import { isDirectional } from '../algorithms/index.js'
import { PRESETS } from '../utils/presets.js'
import HelpTip from './HelpTip.jsx'

/**
 * The Setup card: presets, disk size, starting position, requests, direction, algorithm,
 * Run + Random. Deliberately plain — no metrics, no jargon.
 */
export default function SetupPanel({ config, validation, onChange, onRun, onRandom }) {
  const set = (patch) => onChange(patch)
  const directional = isDirectional(config.algorithm)

  return (
    <section aria-label="Setup" className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Setup</h2>
        <span className="text-xs text-muted">Instant live preview</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-subtle">
        Configure parameters or choose a standard textbook preset below.
      </p>

      {/* Preset Quick Loader */}
      <div className="mt-4 rounded-xl border border-edge-strong bg-base-850 p-2.5">
        <label htmlFor="preset-select" className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Load Example Preset
        </label>
        <select
          id="preset-select"
          defaultValue=""
          onChange={(e) => {
            const chosen = PRESETS.find((p) => p.name === e.target.value)
            if (chosen) onChange(chosen.config)
          }}
          className="num mt-1.5 w-full rounded-lg border border-edge bg-base-900 px-2.5 py-2 text-xs text-ink transition-colors hover:border-base-600 focus:border-head/60 focus:outline-none"
        >
          <option value="" disabled>Select a textbook preset...</option>
          {PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 space-y-5">
        {/* disk size */}
        <div>
          <label htmlFor="disk-size" className="block text-sm font-medium text-ink">
            Disk size
            <HelpTip label="disk position">
              A numbered location on the disk. The head moves between positions to service
              requests.
            </HelpTip>
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              id="disk-size"
              type="number"
              inputMode="numeric"
              min={2}
              className="num w-full rounded-lg border border-edge-strong bg-base-850 px-3 py-2.5 text-[15px] text-ink transition-colors hover:border-base-600 focus:border-head/60 focus:outline-none"
              value={config.diskSize}
              onChange={(event) => set({ diskSize: event.target.value })}
              aria-invalid={Boolean(validation.errors.diskSize)}
            />
            <span className="shrink-0 text-sm text-muted">positions</span>
          </div>
          <FieldError message={validation.errors.diskSize} />
        </div>

        {/* starting position */}
        <div>
          <label htmlFor="head-position" className="block text-sm font-medium text-ink">
            Starting head position
            <HelpTip label="disk head">
              The part of a hard disk that reads or writes data. It moves to the required
              position.
            </HelpTip>
          </label>
          <input
            id="head-position"
            type="number"
            inputMode="numeric"
            min={0}
            className="num mt-1.5 w-full rounded-lg border border-edge-strong bg-base-850 px-3 py-2.5 text-[15px] text-ink transition-colors hover:border-base-600 focus:border-head/60 focus:outline-none"
            value={config.head}
            onChange={(event) => set({ head: event.target.value })}
            aria-invalid={Boolean(validation.errors.head)}
          />
          <FieldError message={validation.errors.head} />
        </div>

        {/* requests */}
        <div>
          <label htmlFor="request-queue" className="block text-sm font-medium text-ink">
            Requests
            <HelpTip label="request">
              A request from the operating system to read or write data at a particular disk
              position.
            </HelpTip>
          </label>
          <textarea
            id="request-queue"
            rows={2}
            spellCheck={false}
            placeholder="98, 183, 37, 122, 14, 124, 65, 67"
            className="num mt-1.5 w-full resize-y rounded-lg border border-edge-strong bg-base-850 px-3 py-2.5 text-[15px] leading-relaxed text-ink transition-colors hover:border-base-600 focus:border-head/60 focus:outline-none"
            value={config.requestText}
            onChange={(event) => set({ requestText: event.target.value })}
            aria-invalid={Boolean(validation.errors.requests)}
          />
          {validation.errors.requests ? (
            <FieldError message={validation.errors.requests.join(' ')} />
          ) : (
            <p className="mt-1.5 text-[13px] text-muted">
              {validation.requests.length} request{validation.requests.length === 1 ? '' : 's'} —
              separate with commas or spaces.
            </p>
          )}
        </div>

        {/* direction */}
        <fieldset className={directional ? '' : 'opacity-60'}>
          <legend className="text-sm font-medium text-ink">Direction</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <DirectionButton
              active={config.direction === 'left'}
              onClick={() => set({ direction: 'left' })}
              icon="←"
              label="Left"
            />
            <DirectionButton
              active={config.direction === 'right'}
              onClick={() => set({ direction: 'right' })}
              icon="→"
              label="Right"
            />
          </div>
          {!directional ? (
            <p className="mt-1.5 text-[13px] text-muted">
              {config.algorithm} does not use direction.
            </p>
          ) : null}
        </fieldset>

        {/* algorithm */}
        <fieldset>
          <legend className="text-sm font-medium text-ink">Algorithm</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {ALGORITHM_IDS.map((id) => {
              const selected = config.algorithm === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => set({ algorithm: id })}
                  aria-pressed={selected}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                    selected
                      ? 'border-head/60 bg-head/10'
                      : 'border-edge-strong bg-base-850 hover:border-base-600'
                  }`}
                >
                  <span
                    className={`num block text-sm font-semibold ${selected ? 'text-head' : 'text-ink'}`}
                  >
                    {id}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {ALGORITHM_INFO[id].tagline}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onRun}
            disabled={!validation.valid}
            className="w-full rounded-xl bg-head px-4 py-3 text-[15px] font-semibold text-black transition-all duration-150 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run Simulation
          </button>
          <button
            type="button"
            onClick={onRandom}
            className="w-full rounded-xl border border-edge-strong bg-base-850 px-4 py-2.5 text-sm font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink"
          >
            Random Example
          </button>
        </div>
      </div>
    </section>
  )
}

function DirectionButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`num flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        active
          ? 'border-head/60 bg-head/10 text-head'
          : 'border-edge-strong bg-base-850 text-subtle hover:border-base-600 hover:text-ink'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-[13px] leading-relaxed text-boundary">{message}</p>
}
