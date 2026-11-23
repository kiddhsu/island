import type { PlayMode, Question } from '../../types'
import { CatchPlay } from './CatchPlay'
import { FlipPlay } from './FlipPlay'
import { ForkPlay } from './ForkPlay'
import { JumpPlay } from './JumpPlay'
import { PipePlay } from './PipePlay'
import { RevealPlay } from './RevealPlay'
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
}

export function PlayStage({ mode, question, onResult }: Props) {
  if (mode === 'jump') {
    const q = asChoice(question)
    if (q) return <JumpPlay key={q.id} question={q} onResult={onResult} />
    if (asMatch(question))
      return <FlipPlay key={question.id} question={asMatch(question)!} onResult={onResult} />
    return <Fallback modeHint="跳躍" onResult={onResult} />
  }

  if (mode === 'catch') {
    const q = asChoice(question)
    if (q) return <CatchPlay key={q.id} question={q} onResult={onResult} />
    const match = asMatch(question)
    if (match) return <FlipPlay key={match.id} question={match} onResult={onResult} />
    return <Fallback modeHint="接物" onResult={onResult} />
  }

  if (mode === 'fork') {
    const q = asChoice(question)
    if (q) return <ForkPlay key={q.id} question={q} onResult={onResult} />
    if (asMatch(question))
      return <FlipPlay key={question.id} question={asMatch(question)!} onResult={onResult} />
    return <Fallback modeHint="岔路" onResult={onResult} />
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
      return <ForkPlay key={choice.id} question={choice} onResult={onResult} />
    }
    return <Fallback modeHint="水管" onResult={onResult} />
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
    <div className="play-stage grounded">
      <p className="app-prompt">此題暫不支援「{modeHint}」玩法。</p>
      <button type="button" className="app-btn" onClick={() => onResult(false)}>
        跳過
      </button>
    </div>
  )
}
