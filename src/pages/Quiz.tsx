import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnswerModal } from '../components/AnswerModal'
import { Modal } from '../components/Modal'
import { ProgressBar } from '../components/ProgressBar'
import { QuestionCard } from '../components/QuestionCard'
import { Timer } from '../components/Timer'
import { btnGhost, btnPrimary, btnSecondary } from '../components/ui'
import { resolveQuestions } from '../lib/bank'
import type { AnswerIndex } from '../lib/scoring'
import { useAttempt } from '../store/attempt'

export function Quiz() {
  const navigate = useNavigate()
  const attempt = useAttempt((s) => s.attempt)
  const { answer, reveal, next, prev, finish } = useAttempt.getState()
  const [answerOpen, setAnswerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const questions = useMemo(() => resolveQuestions(attempt?.questionIds ?? []), [attempt?.questionIds])
  const question = attempt ? questions[attempt.index] : undefined
  const isLast = attempt ? attempt.index === questions.length - 1 : false
  const selected = question && attempt ? attempt.answers[question.id] : undefined
  const modalOpen = answerOpen || confirmOpen

  const done = () => {
    finish()
    navigate('/result')
  }

  const advance = () => {
    if (isLast) setConfirmOpen(true)
    else next()
  }

  // Atajos: 1/2/3 eligen opción, Enter pasa a la siguiente.
  useEffect(() => {
    if (!question || modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault()
        answer(question.id, (Number(e.key) - 1) as AnswerIndex)
      } else if (e.key === 'Enter' && selected !== undefined && target?.tagName !== 'BUTTON') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!attempt || questions.length === 0) return <Navigate to="/" replace />
  if (attempt.finished) return <Navigate to="/result" replace />
  if (!question) return <Navigate to="/" replace />

  const answeredCount = questions.filter((q) => attempt.answers[q.id] !== undefined).length
  const unanswered = questions.length - answeredCount
  const revealed = !!attempt.revealed[question.id]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border px-3 py-1 text-sm text-text-muted">
          {attempt.mode === 'exam' ? 'Simulacro' : 'Práctica'}
        </span>
        <div className="flex items-center gap-2">
          {attempt.deadline !== null && <Timer deadline={attempt.deadline} onExpire={done} />}
          <button type="button" className={btnGhost} onClick={() => setConfirmOpen(true)}>
            Terminar
          </button>
        </div>
      </div>

      <ProgressBar current={attempt.index + 1} total={questions.length} answered={answeredCount} />

      <div className="rounded-xl border border-border bg-surface p-5">
        <QuestionCard
          key={question.id}
          question={question}
          mode={attempt.mode}
          selected={selected}
          revealed={revealed}
          onSelect={(opt) => answer(question.id, opt)}
        />

        {/* Una vez respondida, el feedback ya muestra la respuesta: ocultamos el botón para no anular un acierto. */}
        {attempt.showAnswers && (selected === undefined || revealed) && (
          <button
            type="button"
            className={`${btnSecondary} mt-5 w-full sm:w-auto`}
            onClick={() => {
              reveal(question.id)
              setAnswerOpen(true)
            }}
          >
            Ver respuesta
          </button>
        )}
      </div>

      <nav aria-label="Navegación entre preguntas" className="flex items-center justify-between gap-3">
        <button type="button" className={btnGhost} onClick={prev} disabled={attempt.index === 0}>
          Anterior
        </button>
        {selected === undefined && !isLast ? (
          <button type="button" className={btnSecondary} onClick={next}>
            Saltar
          </button>
        ) : (
          <button type="button" className={btnPrimary} onClick={advance}>
            {isLast ? 'Ver resultado' : 'Siguiente'}
          </button>
        )}
      </nav>

      <p className="hidden text-center text-xs text-text-muted sm:block">
        Atajos: 1, 2 y 3 para elegir · Enter para seguir
      </p>

      <AnswerModal open={answerOpen} onClose={() => setAnswerOpen(false)} question={question} />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="¿Terminar el intento?"
        footer={
          <>
            <button type="button" className={btnSecondary} onClick={() => setConfirmOpen(false)}>
              Seguir respondiendo
            </button>
            <button type="button" className={btnPrimary} onClick={done}>
              Terminar
            </button>
          </>
        }
      >
        <p className="text-text-muted">
          {unanswered > 0
            ? `Te quedan ${unanswered} ${unanswered === 1 ? 'pregunta' : 'preguntas'} sin responder. Cuentan como incorrectas.`
            : 'Respondiste todas las preguntas.'}
        </p>
      </Modal>
    </div>
  )
}
