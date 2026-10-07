/**
 * Preset examples commonly taught in Operating Systems courses.
 */
export const PRESETS = [
  {
    name: 'Textbook Example 1 (Head 100)',
    description: 'Classic OS trajectory example (55, 58, 39, 18, 90, 160, 150, 184)',
    config: {
      diskSize: '200',
      head: '100',
      requestText: '55, 58, 39, 18, 90, 160, 150, 184',
      direction: 'right',
      algorithm: 'FCFS',
    },
  },
  {
    name: 'Silberschatz Reference (Head 53)',
    description: 'Standard benchmark from Silberschatz & Galvin OS concept book',
    config: {
      diskSize: '200',
      head: '53',
      requestText: '98, 183, 37, 122, 14, 124, 65, 67',
      direction: 'right',
      algorithm: 'SSTF',
    },
  },
  {
    name: 'Wide Scan / Edge-to-Edge (Head 50)',
    description: 'Demonstrates SCAN & C-SCAN boundary sweeps and circular wraps',
    config: {
      diskSize: '200',
      head: '50',
      requestText: '176, 79, 34, 60, 92, 11, 41, 114',
      direction: 'right',
      algorithm: 'SCAN',
    },
  },
]

export const DEFAULT_CONFIG = PRESETS[0].config

