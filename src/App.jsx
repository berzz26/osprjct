import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { simulate, simulateAll } from './algorithms/index.js'
import AlgoExplainer from './components/AlgoExplainer.jsx'
import AlgoGrid from './components/AlgoGrid.jsx'
import ClassroomMode from './components/ClassroomMode.jsx'
import ComparePanel from './components/ComparePanel.jsx'
import DiskView, { DiskKey } from './components/DiskView.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import RequestOrder from './components/RequestOrder.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import SetupPanel from './components/SetupPanel.jsx'
import StepCard from './components/StepCard.jsx'
import Transport from './components/Transport.jsx'
import { usePlayback } from './hooks/usePlayback.js'
import { DEFAULT_CONFIG } from './utils/presets.js'
import { randomRequests, validateConfig } from './utils/validation.js'

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [compareOpen, setCompareOpen] = useState(false)
  const [classroom, setClassroom] = useState(false)
  const [speedPreset, setSpeedPreset] = useState(2)
  const compareRef = useRef(null)

  const validation = useMemo(() => validateConfig(config), [config])

  const input = useMemo(
    () => ({
      diskSize: validation.diskSize,
      head: validation.head,
      requests: validation.requests,
      direction: config.direction,
    }),
    [validation, config.direction],
  )

  const result = useMemo(() => {
    if (!validation.valid) return null
    return simulate(config.algorithm, input)
  }, [validation.valid, config.algorithm, input])

  const compareResults = useMemo(() => {
    if (!validation.valid || !compareOpen) return []
    return simulateAll(input)
  }, [validation.valid, compareOpen, input])

  const runId = `${config.algorithm}-${input.diskSize}-${input.head}-${input.direction}-${input.requests.join('.')}`
  const playback = usePlayback({
    totalSteps: result?.movements.length ?? 0,
    runId,
    speedIndex: speedPreset,
  })

  useEffect(() => {
    if (!validation.valid) playback.pause()
  }, [validation.valid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal the comparison table when it opens.
  useEffect(() => {
    if (compareOpen) compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [compareOpen])

  const handleChange = useCallback((patch) => {
    setConfig((current) => ({ ...current, ...patch }))
  }, [])

  const handleRun = useCallback(() => {
    playback.replay()
  }, [playback])

  const handleRandom = useCallback(() => {
    const size = validation.diskSize
    const count = Math.min(Math.max(6, Math.round(size / 14)), 12)
    setConfig((current) => ({
      ...current,
      head: String(Math.floor(Math.random() * size)),
      requestText: randomRequests(size, count).join(', '),
    }))
  }, [validation.diskSize])

  const selectAlgorithm = useCallback((algorithm) => {
    setConfig((current) => ({ ...current, algorithm }))
  }, [])

  return (
    <div className="min-h-screen">
      <Header onPresent={() => setClassroom(true)} canPresent={validation.valid} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        {/* ---------- title ---------- */}
        <div className="mx-auto max-w-3xl pt-8 text-center sm:pt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Disk Scheduling Simulator
          </h1>
          <p className="mt-2 text-lg text-subtle">
            See how the OS decides which disk request to handle next.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            A disk is a row of numbered positions. The head starts at one of them. Several
            requests are waiting. The algorithm decides which request the head visits next.
          </p>
        </div>

        {/* ---------- setup + disk ---------- */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <SetupPanel
            config={config}
            validation={validation}
            onChange={handleChange}
            onRun={handleRun}
            onRandom={handleRandom}
          />

          <div className="min-w-0 space-y-5">
            <section aria-label="Disk" className="card p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink">Watch the disk head move</h2>
              <p className="mt-1 text-sm text-subtle">
                Requests are shown as dots. The yellow marker is the current head position.
              </p>

              {!validation.valid ? (
                <InvalidNotice validation={validation} />
              ) : (
                <div className="mt-6">
                  <DiskView config={input} result={result} step={playback.step} />
                  <div className="mt-5">
                    <DiskKey />
                  </div>
                </div>
              )}
            </section>

            {validation.valid ? (
              <>
                <StepCard
                  algorithm={config.algorithm}
                  input={input}
                  result={result}
                  step={playback.step}
                />
                <div className="card px-5 py-4 sm:px-6">
                  <Transport
                    playback={playback}
                    disabled={!result || result.movements.length === 0}
                    speedPreset={speedPreset}
                    onSpeedPreset={setSpeedPreset}
                  />
                </div>
                <RequestOrder result={result} step={playback.step} onJump={playback.seek} />
                <ResultPanel
                  result={result}
                  requestCount={validation.requests.length}
                  compareOpen={compareOpen}
                  onToggleCompare={() => setCompareOpen((open) => !open)}
                />
                {compareOpen ? (
                  <ComparePanel
                    ref={compareRef}
                    results={compareResults}
                    onSelect={selectAlgorithm}
                    onClose={() => setCompareOpen(false)}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {/* ---------- algorithm reference ---------- */}
        <div className="mt-12 space-y-8">
          {validation.valid ? (
            <AlgoExplainer
              algorithm={config.algorithm}
              input={input}
              result={result}
              step={playback.step}
            />
          ) : null}
          <AlgoGrid selected={config.algorithm} onSelect={selectAlgorithm} />
        </div>
      </main>

      <Footer />

      {classroom && validation.valid ? (
        <ClassroomMode
          algorithm={config.algorithm}
          input={input}
          result={result}
          step={playback.step}
          playback={playback}
          speedPreset={speedPreset}
          onSpeedPreset={setSpeedPreset}
          onExit={() => setClassroom(false)}
        />
      ) : null}
    </div>
  )
}

function InvalidNotice({ validation }) {
  const messages = [
    validation.errors.diskSize,
    validation.errors.head,
    ...(validation.errors.requests ?? []),
  ].filter(Boolean)

  return (
    <div className="mt-6 rounded-xl border border-boundary/30 bg-boundary/[0.06] p-4">
      <p className="text-[15px] font-medium text-boundary">The setup needs attention</p>
      <ul className="mt-2 space-y-1">
        {messages.map((message) => (
          <li key={message} className="text-sm leading-relaxed text-subtle">
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
}
