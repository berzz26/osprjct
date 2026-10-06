/**
 * Beginner-friendly reference content for the six algorithms.
 *
 * Language rules: "disk position" (never "cylinder"), "waiting requests"
 * (never "pending queue"), one short tradeoff sentence each. The single
 * mention of traditional HDD terminology lives in the footnote below.
 */

export const HDD_NOTE =
  'Traditional hard-disk terminology often calls these locations cylinders or tracks. For simplicity, this simulator just calls them numbered disk positions.'

export const ALGORITHM_INFO = {
  FCFS: {
    name: 'FCFS',
    fullName: 'First Come, First Serve',
    tagline: 'Follow the queue',
    definition: 'Handle requests in the order they arrived.',
    how: [
      'Take the first request in the queue.',
      'Move the head there.',
      'Take the next request, and so on.',
    ],
    tradeoff: 'Simple and fair — but the head can travel a long way.',
    diagram: 'queue',
  },
  SSTF: {
    name: 'SSTF',
    fullName: 'Shortest Seek Time First',
    tagline: 'Visit the closest request',
    definition: 'Always handle the waiting request closest to the current head position.',
    how: [
      'Look at every waiting request.',
      'Find the one closest to the head.',
      'Move the head there.',
      'Repeat until nothing is waiting.',
    ],
    tradeoff: 'Short trips — but far-away requests can wait a long time.',
    diagram: 'queue',
  },
  SCAN: {
    name: 'SCAN',
    fullName: 'SCAN (Elevator)',
    tagline: 'Move back and forth',
    definition:
      'Move in one direction, handling requests along the way. When you reach the end of the disk, reverse direction.',
    how: [
      'Start moving in one direction.',
      'Handle every request you pass.',
      'At the end of the disk, turn around.',
      'Handle the rest on the way back.',
    ],
    analogy:
      'Think of it like an elevator: it keeps moving in one direction before coming back.',
    tradeoff: 'Fair, like an elevator — but it sometimes visits empty ends of the disk.',
    diagram: 'sweep-edge',
  },
  LOOK: {
    name: 'LOOK',
    fullName: 'LOOK',
    tagline: 'Move back and forth, but stop at the last request',
    definition:
      'Like SCAN, but turn around when there are no more requests in that direction. It does not travel unnecessarily to the edge.',
    how: [
      'Move in one direction, handling requests.',
      'Stop at the last request — nothing waits beyond it.',
      'Turn around there.',
      'Handle the rest on the way back.',
    ],
    tradeoff: 'Like SCAN, without the wasted trip to the end of the disk.',
    diagram: 'sweep-request',
  },
  'C-SCAN': {
    name: 'C-SCAN',
    fullName: 'Circular SCAN',
    tagline: 'Move in one direction, then return to the beginning',
    definition:
      'Move in one direction only. When you reach the end, return to the beginning and continue.',
    how: [
      'Move in one direction, handling requests.',
      'At the end of the disk, return to the beginning.',
      'Keep moving the same way.',
    ],
    tradeoff: 'Everyone waits about the same time — but the return trip is long.',
    diagram: 'circular-edge',
  },
  'C-LOOK': {
    name: 'C-LOOK',
    fullName: 'Circular LOOK',
    tagline: 'Move in one direction and jump between requests',
    definition:
      'Like C-SCAN, but jump from the last request directly to the first request instead of travelling all the way to the disk edges.',
    how: [
      'Move in one direction, handling requests.',
      'After the last request, jump back to the first waiting one.',
      'Keep moving the same way.',
    ],
    tradeoff: 'Fair, without travelling to the empty ends of the disk.',
    diagram: 'circular-request',
  },
}

export const ALGORITHM_IDS = Object.keys(ALGORITHM_INFO)
