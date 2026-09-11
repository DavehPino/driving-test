import type { Question } from '../data/types'
import { TOPIC_LABEL } from '../data/topics'
import { formatSource } from '../lib/bank'
import type { AnswerIndex } from '../lib/scoring'
import type { Mode } from '../store/attempt'

interface QuestionCardProps {
  question: Question
  mode: Mode
  selected: AnswerIndex | undefined
  revealed: boolean
  onSelect: (option: AnswerIndex) => void
}

const KEYS = ['1', '2', '3'] as const

function optionClass(state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed'): string {
  const base =
    'flex min-h-12 w-full items-start gap-3 rounded-lg border px-4 py-3 text-left leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
  switch (state) {
    case 'selected':
      return `${base} border-primary bg-surface-2`
    case 'correct':
      return `${base} border-success bg-success/10 ring-1 ring-inset ring-success`
    case 'wrong':
      return `${base} border-danger bg-danger/10 ring-1 ring-inset ring-danger`
    case 'dimmed':
      return `${base} border-border bg-surface text-text-muted`
    default:
      return `${base} border-border bg-surface hover:bg-surface-2`
  }
}

export function QuestionCard({ question, mode, selected, revealed, onSelect }: QuestionCardProps) {
  const answered = selected !== undefined
  // En práctica hay feedback inmediato y la respuesta queda bloqueada.
  const showFeedback = mode === 'practice' && answered
  const isRight = selected === question.correctIndex

  return (
    <article aria-labelledby={`q-${question.id}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-text-muted">
          {TOPIC_LABEL[question.topic]}
        </span>
        {revealed && (
          <span className="rounded-full border border-info px-2.5 py-1 text-info">
            Respuesta vista: no cuenta para el puntaje
          </span>
        )}
      </div>

      <h2 id={`q-${question.id}`} className="mt-3 text-xl font-semibold leading-snug">
        {question.text}
      </h2>

      <div role="group" aria-label="Opciones" className="mt-5 space-y-3">
        {question.options.map((option, i) => {
          const idx = i as AnswerIndex
          let state: Parameters<typeof optionClass>[0] = 'idle'
          if (showFeedback) {
            if (idx === question.correctIndex) state = 'correct'
            else if (idx === selected) state = 'wrong'
            else state = 'dimmed'
          } else if (idx === selected) {
            state = 'selected'
          }
          return (
            <button
              key={i}
              type="button"
              aria-pressed={idx === selected}
              disabled={showFeedback}
              onClick={() => onSelect(idx)}
              className={`${optionClass(state)} disabled:cursor-default`}
            >
              <kbd
                aria-hidden="true"
                className="-mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border font-mono text-xs text-text-muted"
              >
                {KEYS[i]}
              </kbd>
              <span>{option}</span>
            </button>
          )
        })}
      </div>

      {showFeedback && (
        <div
          role="status"
          className={`mt-5 rounded-lg border p-4 motion-safe:animate-fade-in ${isRight ? 'border-success/60' : 'border-danger/60'}`}
        >
          <p className={`font-semibold ${isRight ? 'text-success' : 'text-danger'}`}>
            {isRight ? '¡Correcto!' : 'Incorrecto'}
          </p>
          <p className="mt-2 leading-relaxed">{question.explanation}</p>
          <p className="mt-2 text-sm text-text-muted">{formatSource(question)}</p>
        </div>
      )}
    </article>
  )
}
