import { useMemo, useState } from 'react'
import type { OrderQuestion } from '../../types'
import { shuffle } from '../../lib/shuffle'

type Props = {
  question: OrderQuestion
  disabled?: boolean
  reveal?: boolean
  onSubmit: (order: string[]) => void
}

export function OrderEngine({ question, disabled, reveal, onSubmit }: Props) {
  const initial = useMemo(
    () => shuffle(question.items),
    [question.id, question.items],
  )
  const [order, setOrder] = useState(initial)

  function move(index: number, dir: -1 | 1) {
    if (disabled || reveal) return
    const next = [...order]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setOrder(next)
  }

  return (
    <div className="engine">
      <p className="engine-prompt">{question.prompt}</p>
      <ol className="order-list">
        {order.map((item, i) => (
          <li key={`${item}-${i}`} className="order-item">
            <span>{item}</span>
            <span className="order-actions">
              <button
                type="button"
                disabled={disabled || reveal || i === 0}
                onClick={() => move(i, -1)}
                aria-label="上移"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={disabled || reveal || i === order.length - 1}
                onClick={() => move(i, 1)}
                aria-label="下移"
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      {!reveal ? (
        <button
          type="button"
          className="primary-btn"
          disabled={disabled}
          onClick={() => onSubmit(order)}
        >
          確定順序
        </button>
      ) : (
        <p className="engine-explain">
          正確順序：{question.correctOrder.join(' → ')}
        </p>
      )}
    </div>
  )
}
