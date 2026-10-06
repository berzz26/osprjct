export default function Header({ onPresent, canPresent }) {
  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-base-950/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <span className="flex min-w-0 items-center gap-2.5">
          <Logo />
          <span className="truncate text-sm font-semibold text-ink">
            Disk Scheduling Simulator
          </span>
        </span>

        <button
          type="button"
          onClick={onPresent}
          disabled={!canPresent}
          title="Big, distraction-free view for presenting to the class"
          className="num shrink-0 rounded-lg border border-edge-strong bg-base-850 px-3 py-1.5 text-xs font-medium text-subtle transition-colors hover:border-head/50 hover:text-head disabled:cursor-not-allowed disabled:opacity-40"
        >
          Presentation Mode
        </button>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-head/25 bg-head/[0.07]">
      <svg
        viewBox="0 0 24 24"
        className="size-3.5 text-head"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" strokeLinecap="round" />
      </svg>
    </span>
  )
}
