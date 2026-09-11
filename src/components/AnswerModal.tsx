import type { Question } from '../data/types'
import { formatSource } from '../lib/bank'
import { Modal } from './Modal'
import { btnPrimary } from './ui'

interface AnswerModalProps {
  open: boolean
  onClose: () => void
  question: Question
}

const LETTERS = ['1', '2', '3'] as const

export function AnswerModal({ open, onClose, question }: AnswerModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Respuesta correcta"
      footer={
        <button type="button" onClick={onClose} className={btnPrimary}>
          Entendido
        </button>
      }
    >
      <p className="text-text-muted">{question.text}</p>
      <ul className="mt-4 space-y-2">
        {question.options.map((option, i) => {
          const correct = i === question.correctIndex
          return (
            <li
              key={i}
              className={
                correct
                  ? 'flex gap-3 rounded-lg border-2 border-success bg-success/10 p-3 font-medium'
                  : 'flex gap-3 rounded-lg border border-border p-3 text-text-muted'
              }
            >
              <span aria-hidden="true" className="font-mono">
                {LETTERS[i]}
              </span>
              <span>
                {option}
                {correct && <span className="sr-only"> (respuesta correcta)</span>}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 leading-relaxed">{question.explanation}</p>
      <p className="mt-3 text-sm text-text-muted">{formatSource(question)}</p>
      <p className="mt-4 rounded-lg bg-surface-2 p-3 text-sm text-text-muted">
        Esta pregunta queda marcada como vista y no cuenta para el puntaje final.
      </p>
    </Modal>
  )
}
