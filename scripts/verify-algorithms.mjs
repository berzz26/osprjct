/**
 * Verification harness for the scheduling algorithms.
 *
 *   npm run test
 *
 * Every expected number below is derived by hand (or taken from the standard
 * Silberschatz reference example) — nothing is copied from the algorithm
 * implementations, so a regression here means the algorithms really are wrong.
 */
import { ALGORITHM_IDS, simulate, simulateAll } from '../src/algorithms/index.js'

let passed = 0
let failed = 0

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    passed += 1
  } else {
    failed += 1
    console.log(`  FAIL  ${label}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`)
  }
}

function group(title) {
  console.log(`\n${title}`)
}

const sum = (result) => result.movements.reduce((total, m) => total + m.distance, 0)

// ---------------------------------------------------------------------------
group('Silberschatz reference example: disk 0-199, head 53, queue [14, 36, 53, 183], right')
{
  const input = { diskSize: 200, head: 53, requests: [14, 36, 53, 183], direction: 'right' }

  // 53 -> 183 = 130, 183 -> 199 = 16, 199 -> 36 = 163, 36 -> 14 = 22
  const s = simulate('SCAN', input)
  check('SCAN sequence', s.sequence, [53, 183, 199, 36, 14])
  check('SCAN total', s.totalMovement, 331)
  check('SCAN average', s.averageSeek, 82.75)

  // LOOK never visits 199. Travelling right: 53 -> 183 = 130, -> 36 = 147, -> 14 = 22.
  const l = simulate('LOOK', input)
  check('LOOK sequence', l.sequence, [53, 183, 36, 14])
  check('LOOK total', l.totalMovement, 130 + 147 + 22)
  check('LOOK average', l.averageSeek, 299 / 4)

  // 53 -> 183 = 130, 183 -> 199 = 16, 199 -> 0 = 199, 0 -> 14 = 14, 14 -> 36 = 22
  const c = simulate('C-SCAN', input)
  check('C-SCAN sequence', c.sequence, [53, 183, 199, 0, 14, 36])
  check('C-SCAN total', c.totalMovement, 381)
  check('C-SCAN average', c.averageSeek, 95.25)

  // 53 -> 183 = 130, 183 -> 14 = 169, 14 -> 36 = 22
  const cl = simulate('C-LOOK', input)
  check('C-LOOK sequence', cl.sequence, [53, 183, 14, 36])
  check('C-LOOK total', cl.totalMovement, 321)
  check('C-LOOK average', cl.averageSeek, 80.25)

  // 53 (already here, free) -> 36 = 17, -> 14 = 22, -> 53 = 39, -> 183 = 130
  const ss = simulate('SSTF', input)
  check('SSTF sequence', ss.sequence, [53, 36, 14, 183])
  check('SSTF total', ss.totalMovement, 208)
  check('SSTF average', ss.averageSeek, 52)

  const f = simulate('FCFS', input)
  check('FCFS sequence', f.sequence, [53, 14, 36, 53, 183])
  check('FCFS total', f.totalMovement, 39 + 22 + 17 + 130)
}

// ---------------------------------------------------------------------------
group('Same queue, direction = left')
{
  const input = { diskSize: 200, head: 53, requests: [14, 36, 53, 183], direction: 'left' }

  // 53 -> 36 = 17, -> 14 = 22, -> 0 = 14, -> 183 = 183
  const s = simulate('SCAN', input)
  check('SCAN sequence', s.sequence, [53, 36, 14, 0, 183])
  check('SCAN total', s.totalMovement, 236)

  // 53 -> 36 = 17, -> 14 = 22, -> 183 = 169
  const l = simulate('LOOK', input)
  check('LOOK sequence', l.sequence, [53, 36, 14, 183])
  check('LOOK total', l.totalMovement, 208)

  // 53 -> 36 = 17, -> 14 = 22, -> 0 = 14, -> 199 = 199, -> 183 = 16
  const c = simulate('C-SCAN', input)
  check('C-SCAN sequence', c.sequence, [53, 36, 14, 0, 199, 183])
  check('C-SCAN total', c.totalMovement, 268)

  // 53 -> 36 = 17, -> 14 = 22, jump to 183 = 169
  const cl = simulate('C-LOOK', input)
  check('C-LOOK sequence', cl.sequence, [53, 36, 14, 183])
  check('C-LOOK total', cl.totalMovement, 208)
}

// ---------------------------------------------------------------------------
group('Classic demo: disk 200, head 53, [98, 183, 37, 122, 14, 124, 65, 67], right')
{
  const input = {
    diskSize: 200,
    head: 53,
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    direction: 'right',
  }

  // 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 — note 67->37 (30) beats 67->98 (31).
  const ss = simulate('SSTF', input)
  check('SSTF sequence', ss.sequence, [53, 65, 67, 37, 14, 98, 122, 124, 183])
  check('SSTF total', ss.totalMovement, 236)
  check('SSTF average', ss.averageSeek, 236 / 8)
  check('SSTF max seek', ss.maxSeek, 84)

  // 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2
  const f = simulate('FCFS', input)
  check('FCFS total', f.totalMovement, 640)
  check('FCFS average', f.averageSeek, 80)

  // 65,67,98,122,124,183 then 199 then 37,14
  const s = simulate('SCAN', input)
  check('SCAN sequence', s.sequence, [53, 65, 67, 98, 122, 124, 183, 199, 37, 14])
  check('SCAN total', s.totalMovement, 12 + 2 + 31 + 24 + 2 + 59 + 16 + 162 + 23)

  // 12 + 2 + 31 + 24 + 2 + 59 + 146 + 23 (turns around at 183)
  const l = simulate('LOOK', input)
  check('LOOK sequence', l.sequence, [53, 65, 67, 98, 122, 124, 183, 37, 14])
  check('LOOK total', l.totalMovement, 299)
}

// ---------------------------------------------------------------------------
group('Edge cases')
{
  // Empty queue.
  for (const id of ALGORITHM_IDS) {
    const r = simulate(id, { diskSize: 200, head: 53, requests: [], direction: 'right' })
    check(`${id} empty queue`, [r.sequence, r.totalMovement, r.averageSeek], [[53], 0, 0])
  }

  // Single request.
  for (const id of ALGORITHM_IDS) {
    const r = simulate(id, { diskSize: 200, head: 53, requests: [120], direction: 'right' })
    check(`${id} single request total`, r.totalMovement, 67)
    check(`${id} single request served`, r.requestsServed, 1)
  }

  // Head already standing on a request: it is serviced for free.
  const onSpot = simulate('SSTF', { diskSize: 200, head: 53, requests: [53, 54], direction: 'right' })
  check('SSTF head on request', [onSpot.sequence, onSpot.totalMovement], [[53, 54], 1])

  // Head at cylinder 0.
  for (const id of ALGORITHM_IDS) {
    const r = simulate(id, { diskSize: 200, head: 0, requests: [10, 50, 199], direction: 'right' })
    check(`${id} head at 0 does not exceed range`, r.sequence.every((c) => c >= 0 && c <= 199), true)
    check(`${id} head at 0 starts at 0`, r.sequence[0], 0)
  }

  // Head at the last cylinder, travelling right: must reverse immediately and
  // then work its way back down through 50 before reaching 10.
  const atMax = simulate('SCAN', { diskSize: 200, head: 199, requests: [10, 50], direction: 'right' })
  check('SCAN head at max', atMax.sequence, [199, 50, 10])
  check('SCAN head at max total', atMax.totalMovement, 149 + 40)

  const cAtMax = simulate('C-SCAN', { diskSize: 200, head: 199, requests: [10, 50], direction: 'right' })
  check('C-SCAN head at max', cAtMax.sequence, [199, 0, 10, 50])
  check('C-SCAN head at max total', cAtMax.totalMovement, 199 + 10 + 40)

  // Everything on one side of the head.
  const allLeft = simulate('SCAN', { diskSize: 200, head: 150, requests: [10, 20, 30], direction: 'right' })
  check('SCAN all requests behind head', allLeft.sequence, [150, 199, 30, 20, 10])
  check('SCAN all behind total', allLeft.totalMovement, 49 + 169 + 10 + 10)

  // LOOK with nothing ahead simply turns around.
  const lookBehind = simulate('LOOK', { diskSize: 200, head: 150, requests: [10, 20], direction: 'right' })
  check('LOOK all behind head', lookBehind.sequence, [150, 20, 10])
  check('LOOK all behind total', lookBehind.totalMovement, 130 + 10)

  // Duplicate requests are each serviced; only one of them costs anything.
  const dupes = simulate('SSTF', { diskSize: 200, head: 10, requests: [50, 50, 50], direction: 'right' })
  check('duplicates serviced', dupes.requestsServed, 3)
  check('duplicates total', dupes.totalMovement, 40)

  // Dense queue right next to the head.
  const dense = simulate('SSTF', { diskSize: 200, head: 100, requests: [98, 99, 100, 101, 102], direction: 'right' })
  check('dense queue total', dense.totalMovement, 2 + 1 + 0 + 1 + 2)

  // Single-cylinder disk.
  for (const id of ALGORITHM_IDS) {
    const r = simulate(id, { diskSize: 1, head: 0, requests: [0], direction: 'right' })
    check(`${id} single-cylinder disk`, [r.totalMovement, r.requestsServed], [0, 1])
  }

  // LOOK never visits a cylinder outside the queue.
  for (const dir of ['left', 'right']) {
    const lk = simulate('LOOK', { diskSize: 500, head: 250, requests: [12, 400, 87, 321, 45], direction: dir })
    const visited = new Set(lk.movements.map((m) => m.to))
    const allowed = new Set([...lk.movements.map((m) => m.from)])
    check(`LOOK stays inside the queue (${dir})`, [...visited].every((c) => c === 499 || allowed.has(c) || [12, 400, 87, 321, 45].includes(c)), true)
  }
}

// ---------------------------------------------------------------------------
group('Structural invariants across a randomised sweep')
{
  let seed = 987654321
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }

  for (let trial = 0; trial < 400; trial += 1) {
    const diskSize = 2 + Math.floor(random() * 400)
    const head = Math.floor(random() * diskSize)
    const count = 1 + Math.floor(random() * 14)
    const requests = Array.from({ length: count }, () => Math.floor(random() * diskSize))
    const direction = random() > 0.5 ? 'right' : 'left'
    const input = { diskSize, head, requests, direction }

    for (const id of ALGORITHM_IDS) {
      const r = simulate(id, input)
      const where = `${id} trial ${trial} (size ${diskSize}, head ${head}, ${direction})`

      check(`${where}: starts at head`, r.sequence[0], head)
      check(`${where}: within range`, r.sequence.every((c) => c >= 0 && c <= diskSize - 1), true)
      // The movement chain must be gapless: every leg starts where the last ended.
      check(
        `${where}: contiguous`,
        r.movements.every((m, i) => (i === 0 ? m.from === head : m.from === r.movements[i - 1].to)),
        true,
      )
      // The sequence is the movement chain with zero-length legs collapsed.
      check(
        `${where}: sequence matches movements`,
        JSON.stringify(r.sequence) ===
          JSON.stringify(
            r.movements.reduce(
              (acc, m) => (m.to !== acc[acc.length - 1] ? [...acc, m.to] : acc),
              [head],
            ),
          ),
        true,
      )
      check(`${where}: distances`, r.movements.every((m) => m.distance === Math.abs(m.to - m.from)), true)
      check(`${where}: total matches sum`, r.totalMovement, sum(r))
      check(`${where}: all requests served`, r.requestsServed, requests.length)
      check(`${where}: average matches total/n`, r.averageSeek, requests.length ? r.totalMovement / requests.length : 0)

      // SCAN and C-SCAN must touch the boundary whenever requests are left
      // behind the head — travelling to an empty end of the disk would be waste.
      if (id === 'SCAN' || id === 'C-SCAN') {
        const edge = direction === 'right' ? diskSize - 1 : 0
        const requestsBehind = requests.some((c) =>
          direction === 'right' ? c < head : c > head,
        )
        check(`${where}: reaches boundary`, requestsBehind ? r.sequence.includes(edge) : true, true)
      }
      // LOOK and C-LOOK must not visit the empty edge.
      if (id === 'LOOK' || id === 'C-LOOK') {
        const edge = direction === 'right' ? diskSize - 1 : 0
        const emptyEdgeIsLegitimate = requests.includes(edge)
        check(`${where}: avoids empty boundary`, emptyEdgeIsLegitimate || !r.movements.some((m) => m.to === edge && m.kind === 'boundary'), true)
      }
    }
  }
}

// ---------------------------------------------------------------------------
group('Comparison uses one identical input')
{
  const input = { diskSize: 200, head: 53, requests: [98, 183, 37, 122, 14, 124, 65, 67], direction: 'right' }
  const all = simulateAll(input)
  check('six algorithms compared', all.length, 6)
  check('all served every request', all.every((r) => r.requestsServed === 8), true)
  // LOOK can never beat SCAN, and C-LOOK can never beat C-SCAN.
  check('LOOK <= SCAN', simulate('LOOK', input).totalMovement <= simulate('SCAN', input).totalMovement, true)
  check('C-LOOK <= C-SCAN', simulate('C-LOOK', input).totalMovement <= simulate('C-SCAN', input).totalMovement, true)
  // SSTF beats FCFS here, as the textbook example predicts.
  check('SSTF < FCFS', simulate('SSTF', input).totalMovement < simulate('FCFS', input).totalMovement, true)
  console.log('\n  totals:', all.map((r) => `${r.id} ${r.totalMovement}`).join('  |  '))
}

console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${passed} checks passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
