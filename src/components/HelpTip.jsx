/**
 * A small "?" button beside a technical term. The definition appears on
 * hover or keyboard focus — never forced on the reader.
 */
export default function HelpTip({ label, children }) {
  return (
    <span className="group/tip relative ml-1.5 inline-flex align-middle">
      <button
        type="button"
        aria-label={`What is ${label}?`}
        className="grid size-[17px] place-items-center rounded-full border border-edge-strong bg-base-800 text-[11px] font-semibold text-muted transition-colors hover:border-head/50 hover:text-head focus-visible:border-head focus-visible:text-head"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-50 w-60 -translate-x-1/2 rounded-lg border border-edge-strong bg-base-850 p-3 text-xs font-normal leading-relaxed text-subtle opacity-0 shadow-xl shadow-black/60 transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {children}
      </span>
    </span>
  )
}
