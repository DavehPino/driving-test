import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TOPIC_LABEL } from '../data/topics'
import type { Question } from '../data/types'
import { btnGhost, btnPrimary, btnSecondary } from '../components/ui'
import { formatSource, resolveQuestions } from '../lib/bank'
import { computeScore, isCorrect, type Answers } from '../lib/scoring'
import { useAttempt, wrongQuestionIds } from '../store/attempt'

export function Result() {
  const navigate = useNavigate()
  const attempt = useAttempt((s) => s.attempt)
  const { retryWrong, restart } = useAttempt.getState()

  const questions = useMemo(() => resolveQuestions(attempt?.questionIds ?? []), [attempt?.questionIds])

  if (!attempt) return <Navigate to="/" replace />
  if (!attempt.finished) return <Navigate to="/quiz" replace />

  const score = computeScore(questions, attempt.answers, attempt.revealed)
  const wrong = questions.filter((q) => !attempt.revealed[q.id] && !isCorrect(q, attempt.answers))
  const seen = questions.filter((q) => attempt.revealed[q.id])
  const canRetry = wrongQuestionIds(attempt).length > 0

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="result-title"
        className={`rounded-xl border-2 bg-surface p-6 text-center ${score.passed ? 'border-success' : 'border-danger'}`}
      >
        <p className="text-sm uppercase tracking-wide text-text-muted">
          {attempt.mode === 'exam' ? 'Simulacro de examen' : 'Práctica'}
        </p>
        <h1
          id="result-title"
          className={`mt-2 text-4xl font-black tracking-tight motion-safe:animate-panel-in ${score.passed ? 'text-success' : 'text-danger'}`}
        >
          {score.passed ? 'APROBADO' : 'DESAPROBADO'}
        </h1>
        <p className="mt-4 font-mono text-3xl tabular-nums">
          {score.correct}/{score.total}
          <span className="ml-3 text-xl text-text-muted">{score.percentage} %</span>
        </p>
        <p className="mt-2 text-text-muted">
          Mínimo para aprobar: {score.threshold} de {score.total} (85 %)
        </p>
        {score.revealedCount > 0 && (
          <p className="mx-auto mt-4 max-w-md rounded-lg bg-surface-2 p-3 text-sm">
            Viste la respuesta de {score.revealedCount} {score.revealedCount === 1 ? 'pregunta' : 'preguntas'}.{' '}
            {score.revealedCount === 1 ? 'Quedó excluida' : 'Quedaron excluidas'} del puntaje, que se calcula sobre{' '}
            {score.total} {score.total === 1 ? 'pregunta' : 'preguntas'}.
          </p>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className={`${btnPrimary} flex-1`}
          disabled={!canRetry}
          onClick={() => {
            retryWrong()
            navigate('/quiz')
          }}
        >
          Repetir solo las que fallé
        </button>
        <button
          type="button"
          className={`${btnSecondary} flex-1`}
          onClick={() => {
            restart()
            navigate('/quiz')
          }}
        >
          Nuevo intento
        </button>
        <button type="button" className={`${btnGhost} flex-1`} onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>

      {score.byTopic.length > 0 && (
        <section aria-labelledby="topics-title">
          <h2 id="topics-title" className="mb-3 text-lg font-semibold">
            Resultado por tema
          </h2>
          <div className="overflow-x-auto rounded-xl bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="text-text-muted">
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-2 font-medium">
                    Tema
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Correctas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...score.byTopic]
                  .sort((a, b) => a.correct / a.total - b.correct / b.total)
                  .map((t) => {
                    const ok = t.correct === t.total
                    return (
                      <tr key={t.topic}>
                        <td className="px-4 py-2">{TOPIC_LABEL[t.topic]}</td>
                        <td
                          className={`px-4 py-2 text-right font-mono tabular-nums ${ok ? 'text-success' : 'text-text'}`}
                        >
                          {t.correct}/{t.total}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {wrong.length > 0 && (
        <ReviewList title="Para repasar" subtitle="Incorrectas o sin responder" items={wrong} answers={attempt.answers} />
      )}

      {seen.length > 0 && (
        <ReviewList
          title="Respuestas vistas"
          subtitle="No cuentan para el puntaje"
          items={seen}
          answers={attempt.answers}
        />
      )}
    </div>
  )
}

interface ReviewListProps {
  title: string
  subtitle: string
  items: Question[]
  answers: Answers
}

function ReviewList({ title, subtitle, items, answers }: ReviewListProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold">
        {title} <span className="text-sm font-normal text-text-muted">· {subtitle}</span>
      </h2>
      <ol className="mt-3 space-y-3">
        {items.map((q) => {
          const chosen = answers[q.id]
          return (
            <li key={q.id} className="rounded-xl bg-surface p-4 shadow-card">
              <p className="text-xs text-text-muted">{TOPIC_LABEL[q.topic]}</p>
              <p className="mt-1 font-medium">{q.text}</p>
              {chosen === undefined ? (
                <p className="mt-2 text-sm text-text-muted">Sin responder</p>
              ) : (
                chosen !== q.correctIndex && (
                  <p className="mt-2 text-sm text-danger">Tu respuesta: {q.options[chosen]}</p>
                )
              )}
              <p className="mt-1 text-sm text-success">Correcta: {q.options[q.correctIndex]}</p>
              <p className="mt-2 text-sm leading-relaxed">{q.explanation}</p>
              <p className="mt-2 text-xs text-text-muted">{formatSource(q)}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
