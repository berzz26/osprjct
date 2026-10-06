export default function Footer() {
  return (
    <footer className="border-t border-edge bg-base-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold text-ink">Disk Scheduling Simulator</p>
        <p className="mt-1 text-sm text-muted">An Operating Systems classroom activity.</p>
        <p className="num mt-3 text-xs text-muted">FCFS • SSTF • SCAN • LOOK • C-SCAN • C-LOOK</p>
        <p className="mt-4 border-t border-edge pt-4 text-xs leading-relaxed text-muted">
          Built for OS Activity. Every number is calculated live from the algorithms — nothing is
          precomputed.
        </p>
      </div>
    </footer>
  )
}
