import { useMemo, useState } from 'react'
import type { MatchQuestion } from '../../types'
import { shuffle } from '../../lib/shuffle'

type Props = {
  question: MatchQuestion
  disabled?: boolean
  reveal?: boolean
  onSubmit: (mapping: Record<string, string>) => void
}

export function MatchEngine({ question, disabled, reveal, onSubmit }: Props) {
  const lefts = useMemo(
    () => question.pairs.map((p) => p.left),
    [question.id, question.pairs],
  )
  const rights = useMemo(
    () => shuffle(question.pairs.map((p) => p.right)),
    [question.id, question.pairs],
  )
  const [mapping, setMapping] = useState<Record<string, string>>({})

  return (
    <div className="engine">
      <p className="engine-prompt">{question.prompt}</p>
      <div className="match-grid">
        {lefts.map((left) => (
          <label key={left} className="match-row">
            <span>{left}</span>
            <select
              disabled={disabled || reveal}
              value={mapping[left] ?? ''}
              onChange={(e) =>
                setMapping((m) => ({ ...m, [left]: e.target.value }))
              }
            >
              <option value="">選一選</option>
              {rights.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {!reveal ? (
        <button
          type="button"
          className="primary-btn"
          disabled={
            disabled || lefts.some((l) => !mapping[l]) || lefts.length === 0
          }
          onClick={() => onSubmit(mapping)}
        >
          送出配對
        </button>
      ) : (
        <ul className="engine-explain">
          {question.pairs.map((p) => (
            <li key={p.left}>
              {p.left} → {p.right}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
