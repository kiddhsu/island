import type { ReactNode } from 'react'
import type { ChoiceQuestion, PlayMode, Question } from '../../types'
import { BinsPlay } from './BinsPlay'
import { CatchPlay } from './CatchPlay'
import { FlipPlay } from './FlipPlay'
import { ForkPlay } from './ForkPlay'
import { ClockPlay } from './ClockPlay'
import { JumpPlay } from './JumpPlay'
import { PackPlay } from './PackPlay'
import { PipePlay } from './PipePlay'
import { PopPlay } from './PopPlay'
import { RevealPlay } from './RevealPlay'
import { TrafficPlay } from './TrafficPlay'
import {
  asChoice,
  asMatch,
  asOrder,
  type PlayResultHandler,
} from './types'

type Props = {
  mode: PlayMode
  question: Question
  onResult: PlayResultHandler
  /** 僅整輪第一題需要開場倒數 */
  introCountdown?: boolean
}

function withChoice(
  question: Question,
  render: (q: ChoiceQuestion) => ReactNode,
  modeHint: string,
  onResult: PlayResultHandler,
) {
  const q = asChoice(question)
  if (q) return render(q)
  const match = asMatch(question)
  if (match) return <FlipPlay key={match.id} question={match} onResult={onResult} />
  return <Fallback modeHint={modeHint} onResult={onResult} />
}

export function PlayStage({
  mode,
  question,
  onResult,
  introCountdown = false,
}: Props) {
  if (mode === 'jump') {
    return withChoice(
      question,
      (q) => (
        <JumpPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '跳躍',
      onResult,
    )
  }

  if (mode === 'catch') {
    return withChoice(
      question,
      (q) => (
        <CatchPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '接物',
      onResult,
    )
  }

  if (mode === 'fork') {
    return withChoice(
      question,
      (q) => (
        <ForkPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '岔路',
      onResult,
    )
  }

  if (mode === 'flip') {
    const match = asMatch(question)
    if (match) return <FlipPlay key={match.id} question={match} onResult={onResult} />
    const choice = asChoice(question)
    if (choice) return <RevealPlay key={choice.id} question={choice} onResult={onResult} />
    return <Fallback modeHint="翻牌" onResult={onResult} />
  }

  if (mode === 'pipe') {
    const order = asOrder(question)
    if (order) return <PipePlay key={order.id} question={order} onResult={onResult} />
    const choice = asChoice(question)
    if (choice) {
      return (
        <ForkPlay
          key={choice.id}
          question={choice}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      )
    }
    return <Fallback modeHint="水管" onResult={onResult} />
  }

  if (mode === 'clock') {
    return withChoice(
      question,
      (q) => (
        <ClockPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '時鐘',
      onResult,
    )
  }

  if (mode === 'traffic') {
    return withChoice(
      question,
      (q) => (
        <TrafficPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '紅綠燈',
      onResult,
    )
  }

  if (mode === 'bins') {
    return withChoice(
      question,
      (q) => (
        <BinsPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '分類桶',
      onResult,
    )
  }

  if (mode === 'pack') {
    return withChoice(
      question,
      (q) => (
        <PackPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '背包',
      onResult,
    )
  }

  if (mode === 'pop') {
    return withChoice(
      question,
      (q) => (
        <PopPlay
          key={q.id}
          question={q}
          onResult={onResult}
          introCountdown={introCountdown}
        />
      ),
      '氣球',
      onResult,
    )
  }

  return <Fallback modeHint="關卡" onResult={onResult} />
}

function Fallback({
  modeHint,
  onResult,
}: {
  modeHint: string
  onResult: PlayResultHandler
}) {
  return (
    <div className="play-wrap">
      <p className="play-prompt">此題暫不支援「{modeHint}」玩法。</p>
      <button type="button" className="app-btn block" onClick={() => onResult(false)}>
        跳過
      </button>
    </div>
  )
}
