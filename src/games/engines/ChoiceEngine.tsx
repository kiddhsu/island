import type { ChoiceQuestion } from '../../types'

type Props = {
  question: ChoiceQuestion
  disabled?: boolean
  selected?: number | null
  reveal?: boolean
  onSelect: (index: number) => void
}

export function ChoiceEngine({
  question,
  disabled,
  selected,
  reveal,
  onSelect,
}: Props) {
  return (
    <div className="engine">
      <p className="engine-prompt">{question.prompt}</p>
      {question.hint ? <p className="engine-hint">{question.hint}</p> : null}
      <div className="choice-grid">
        {question.choices.map((c, i) => {
          let cls = 'choice-btn'
          if (reveal && i === question.answerIndex) cls += ' is-correct'
          if (reveal && selected === i && i !== question.answerIndex)
            cls += ' is-wrong'
          if (!reveal && selected === i) cls += ' is-picked'
          return (
            <button
              key={`${question.id}-${i}`}
              type="button"
              className={cls}
              disabled={disabled}
              onClick={() => onSelect(i)}
            >
              {c}
            </button>
          )
        })}
      </div>
      {reveal && question.explain ? (
        <p className="engine-explain">{question.explain}</p>
      ) : null}
    </div>
  )
}
