import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { ChoiceQuestion } from '../../types'
import { playSfx } from '../../lib/sfx'
import { pickPlayChoices } from './choiceUtils'
import { PlayBurst } from './PlayBurst'
import { PlayCountdown } from './PlayCountdown'
import { PlayHero, type HeroMood } from './PlayHero'
import { usePlayReady } from './usePlayReady'
import type { PlayResultHandler } from './types'

type Falling = {
  id: string
  label: string
  correct: boolean
  x: number
  y: number
}

type Props = {
  question: ChoiceQuestion
  onResult: PlayResultHandler
  introCountdown?: boolean
}

export function CatchPlay({ question, onResult, introCountdown = false }: Props) {
  const { ready, onReady, countdown } = usePlayReady(question.id, introCountdown)
  const [heroX, setHeroX] = useState(50)
  const [items, setItems] = useState<Falling[]>([])
  const [locked, setLocked] = useState(false)
  const [burst, setBurst] = useState<{ ok: boolean; x: string; y: string } | null>(
    null,
  )
  const [mood, setMood] = useState<HeroMood>('idle')
  const ended = useRef(false)
  const dragging = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const pack = useMemo(() => pickPlayChoices(question, 4), [question])
  const busy = !ready || locked

  /** 打亂水平航道，避免永遠左→右同一排 */
  function shuffleLanes(count: number) {
    const base = [14, 32, 50, 68, 84].slice(0, Math.max(count, 1))
    while (base.length < count) base.push(20 + base.length * 15)
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = base[i]!
      base[i] = base[j]!
      base[j] = tmp
    }
    return base
  }

  function spawnItems(
    source: typeof pack,
    qid: string,
  ): Falling[] {
    const lanes = shuffleLanes(source.length)
    const order = source.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = order[i]!
      order[i] = order[j]!
      order[j] = tmp
    }
    return order.map((idx, wave) => {
      const p = source[idx]!
      return {
        id: `${qid}-${idx}-${wave}-${Math.random().toString(36).slice(2, 6)}`,
        label: p.label,
        correct: p.correct,
        x: lanes[wave] ?? 50,
        // 錯落高度，開始後才落下
        y: -10 - wave * 22 - Math.floor(Math.random() * 10),
      }
    })
  }

  useEffect(() => {
    ended.current = false
    setLocked(false)
    setBurst(null)
    setMood('idle')
    setHeroX(50)
    setItems(spawnItems(pack, question.id))
  }, [pack, question.id])

  useEffect(() => {
    if (!ready || locked) return
    const timer = window.setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, y: it.y + 0.75 })))
    }, 50)
    return () => window.clearInterval(timer)
  }, [ready, locked, question.id])

  function finish(ok: boolean, x: number, y: number) {
    if (ended.current) return
    ended.current = true
    setLocked(true)
    dragging.current = false
    setMood(ok ? 'cheer' : 'oops')
    setBurst({
      ok,
      x: `${x}%`,
      y: `${Math.min(78, Math.max(28, y))}%`,
    })
    playSfx(ok ? 'correct' : 'wrong', ok ? 0.55 : 0.45)
    window.setTimeout(() => onResultRef.current(ok), ok ? 720 : 780)
  }

  useEffect(() => {
    if (!ready || locked || ended.current) return

    for (const it of items) {
      if (it.y < 72 || it.y > 92) continue
      if (Math.abs(it.x - heroX) > 18) continue
      finish(it.correct, it.x, it.y)
      return
    }

    if (items.length && items.every((it) => it.y > 108) && !ended.current) {
      setItems(spawnItems(pack, question.id))
    }
  }, [items, heroX, locked, ready, pack, question.id])

  function setHeroFromClientX(clientX: number) {
    const el = stageRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setHeroX(Math.min(88, Math.max(12, pct)))
  }

  function move(dx: number) {
    if (busy) return
    playSfx('tap', 0.2)
    setHeroX((x) => Math.min(88, Math.max(12, x + dx)))
  }

  function tapItem(it: Falling) {
    if (busy || ended.current) return
    if (it.y < 8 || it.y > 98) return
    playSfx('tap', 0.3)
    finish(it.correct, it.x, it.y)
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (busy) return
    const target = e.target as HTMLElement
    if (
      target.closest('.catch-item') ||
      target.closest('.play-stage-tip') ||
      target.closest('.ctrl-pad')
    ) {
      return
    }
    dragging.current = true
    stageRef.current?.setPointerCapture(e.pointerId)
    setHeroFromClientX(e.clientX)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current || busy) return
    setHeroFromClientX(e.clientX)
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false
    try {
      stageRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="play-wrap">
      <p className="play-prompt">{question.prompt}</p>
      <div
        ref={stageRef}
        className="play-stage grounded is-drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <p className="play-stage-tip">
          {ready ? '拖移畫面或點掉落物；也可按下方左右鍵' : '倒數結束後開始接！'}
        </p>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className="catch-item"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            disabled={busy}
            onClick={() => tapItem(it)}
          >
            {it.label}
          </button>
        ))}
        <PlayHero
          pose="catch"
          mood={mood}
          style={{ left: `calc(${heroX}% - 32px)` }}
        />
        {burst ? <PlayBurst ok={burst.ok} x={burst.x} y={burst.y} /> : null}
        {countdown ? (
          <PlayCountdown resetKey={question.id} onReady={onReady} />
        ) : null}
      </div>
      <div className="play-pick-panel catch-ctrl-panel">
        <div className="ctrl-bar catch-ctrl-bar">
          <button
            type="button"
            className="ctrl-pad"
            aria-label="向左"
            disabled={busy}
            onClick={() => move(-16)}
          >
            ◀ 左
          </button>
          <button
            type="button"
            className="ctrl-pad"
            aria-label="向右"
            disabled={busy}
            onClick={() => move(16)}
          >
            右 ▶
          </button>
        </div>
      </div>
    </div>
  )
}
