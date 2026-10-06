const SPEEDS = [
  { label: 'Slow', index: 0 },
  { label: 'Normal', index: 2 },
  { label: 'Fast', index: 4 },
]

/**
 * Transport: Play, Pause, Replay, and a simple speed choice. Nothing else.
 */
export default function Transport({ playback, disabled, speedPreset, onSpeedPreset }) {
  const { playing, atEnd } = playback

  return (
    <div className="flex flex-wrap items-center gap-2">
      {playing ? (
        <button type="button" onClick={playback.pause} disabled={disabled} className={primary}>
          <PauseIcon /> Pause
        </button>
      ) : (
        <button type="button" onClick={playback.play} disabled={disabled} className={primary}>
          <PlayIcon /> {atEnd ? 'Play again' : 'Play'}
        </button>
      )}

      <button type="button" onClick={playback.replay} disabled={disabled} className={secondary}>
        <ReplayIcon /> Replay
      </button>

      <div className="ml-auto flex items-center gap-1 rounded-lg border border-edge-strong bg-base-850 p-1">
        {SPEEDS.map((speed) => (
          <button
            key={speed.label}
            type="button"
            onClick={() => onSpeedPreset(speed.index)}
            aria-pressed={speedPreset === speed.index}
            className={`num rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              speedPreset === speed.index
                ? 'bg-base-700 text-ink'
                : 'text-muted hover:text-subtle'
            }`}
          >
            {speed.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const primary =
  'num inline-flex items-center gap-2 rounded-xl bg-head px-5 py-2.5 text-sm font-semibold text-black transition-all duration-150 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40'

const secondary =
  'num inline-flex items-center gap-2 rounded-xl border border-edge-strong bg-base-850 px-4 py-2.5 text-sm font-medium text-subtle transition-colors hover:border-base-600 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

const svg = 'size-4 shrink-0'

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className={svg} fill="currentColor" aria-hidden="true">
      <path d="M4 2.6v10.8c0 .5.6.8 1 .5l8-5.4a.6.6 0 0 0 0-1l-8-5.4c-.4-.3-1 0-1 .5Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" className={svg} fill="currentColor" aria-hidden="true">
      <rect x="3" y="2.5" width="3.5" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3.5" height="11" rx="1" />
    </svg>
  )
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 16 16" className={svg} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.9-4.2" strokeLinecap="round" />
      <path d="M13.2 1.6v3.1h-3.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
