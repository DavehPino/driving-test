import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPICS } from '../data/topics'
import type { Topic } from '../data/types'
import { btnPrimary, btnSecondary } from '../components/ui'
import { countByTopic } from '../lib/bank'
import { formatDate } from '../lib/format'
import { EXAM_MINUTES, EXAM_QUESTIONS, passThreshold, roundTo1 } from '../lib/scoring'
import { useAttempt, type Mode } from '../store/attempt'
import { useHistory } from '../store/history'

const COUNTS = [10, 20, 40] as const
const EXAM_HELP = 'No disponible en el simulacro: el examen real no tiene ayudas.'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export function Home() {
  const navigate = useNavigate()
  const start = useAttempt((s) => s.start)
  const current = useAttempt((s) => s.attempt)

  const [mode, setMode] = useState<Mode>('practice')
  const [count, setCount] = useState<number>(10)
  const [topics, setTopics] = useState<Topic[]>([])
  const [showAnswers, setShowAnswers] = useState(false)

  const isExam = mode === 'exam'
  const available = countByTopic(isExam ? [] : topics)
  const requested = isExam ? EXAM_QUESTIONS : count
  const effective = Math.min(requested, available)

  const toggleTopic = (t: Topic) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const onStart = () => {
    start({ mode, count, topics: isExam ? [] : topics, showAnswers: !isExam && showAnswers })
    navigate('/quiz')
  }

  const inProgress = current && !current.finished ? current : null

  return (
    <div className="space-y-8">
      {inProgress && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-info/50 bg-surface p-4">
          <p>
            Tenés un {inProgress.mode === 'exam' ? 'simulacro' : 'intento de práctica'} en curso.
          </p>
          <button type="button" className={btnSecondary} onClick={() => navigate('/quiz')}>
            Continuar
          </button>
        </div>
      )}

      <section aria-labelledby="config-title" className="space-y-6">
        <div>
          <h1 id="config-title" className="text-2xl font-bold">
            Prepará el examen teórico
          </h1>
          <p className="mt-1 text-text-muted">
            Elegí cómo querés practicar. El examen real tiene {EXAM_QUESTIONS} preguntas, {EXAM_MINUTES} minutos y
            se aprueba con {passThreshold(EXAM_QUESTIONS)} correctas (85 %).
          </p>
        </div>

        <fieldset>
          <legend className="mb-3 font-semibold">Modo</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModeCard
              value="practice"
              checked={mode === 'practice'}
              onChange={setMode}
              title="Práctica"
              description="Elegís cantidad y temas. Ves si acertaste al instante."
            />
            <ModeCard
              value="exam"
              checked={mode === 'exam'}
              onChange={setMode}
              title="Simulacro de examen"
              description={`${EXAM_QUESTIONS} preguntas al azar, ${EXAM_MINUTES} minutos, sin ayudas.`}
            />
          </div>
        </fieldset>

        {!isExam && (
          <>
            <fieldset>
              <legend className="mb-3 font-semibold">Cantidad de preguntas</legend>
              <div className="flex gap-3">
                {COUNTS.map((n) => (
                  <label key={n} className="flex-1">
                    <input
                      type="radio"
                      name="count"
                      value={n}
                      checked={count === n}
                      onChange={() => setCount(n)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface font-semibold peer-checked:border-primary peer-checked:bg-surface-2 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary`}
                    >
                      {n}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-semibold">
                Temas <span className="font-normal text-text-muted">(opcional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={topics.length === 0}
                  onClick={() => setTopics([])}
                  className={chipClass(topics.length === 0)}
                >
                  Todos
                </button>
                {TOPICS.map((t) => {
                  const on = topics.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleTopic(t.id)}
                      className={chipClass(on)}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </>
        )}

        <div
          className={`rounded-xl border p-4 ${isExam ? 'border-border bg-surface/50' : 'border-border bg-surface'}`}
          title={isExam ? EXAM_HELP : undefined}
        >
          <label className={`flex items-start gap-3 ${isExam ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={!isExam && showAnswers}
              disabled={isExam}
              onChange={(e) => setShowAnswers(e.target.checked)}
              aria-describedby="show-answers-help"
              className={`mt-0.5 h-5 w-5 shrink-0 accent-primary ${focusRing}`}
            />
            <span>
              <span className={`font-semibold ${isExam ? 'text-text-muted' : ''}`}>
                Mostrar respuestas durante la práctica
              </span>
              <span id="show-answers-help" className="mt-1 block text-sm text-text-muted">
                {isExam
                  ? EXAM_HELP
                  : 'Agrega un botón "Ver respuesta" en cada pregunta. Las respuestas que veas no cuentan para el puntaje.'}
              </span>
            </span>
          </label>
        </div>

        <div>
          {available === 0 ? (
            <p className="mb-3 text-sm text-danger">No hay preguntas para los temas elegidos.</p>
          ) : (
            effective < requested && (
              <p className="mb-3 text-sm text-text-muted">
                Hay {available} preguntas disponibles{isExam ? ' en el banco' : ' para esos temas'}: vas a responder{' '}
                {effective}.
              </p>
            )
          )}
          <button type="button" className={`${btnPrimary} w-full text-lg`} disabled={available === 0} onClick={onStart}>
            Empezar
          </button>
        </div>
      </section>

      <RecentAttempts />
    </div>
  )
}

function chipClass(on: boolean): string {
  return `min-h-10 rounded-full border px-3.5 py-1.5 text-sm ${focusRing} ${
    on ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-surface text-text-muted hover:text-text'
  }`
}

interface ModeCardProps {
  value: Mode
  checked: boolean
  onChange: (m: Mode) => void
  title: string
  description: string
}

function ModeCard({ value, checked, onChange, title, description }: ModeCardProps) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name="mode"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span className="block h-full rounded-xl border border-border bg-surface p-4 peer-checked:border-primary peer-checked:bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-text-muted">{description}</span>
      </span>
    </label>
  )
}

function RecentAttempts() {
  const entries = useHistory((s) => s.entries)
  if (entries.length === 0) return null

  const recent = entries.slice(0, 5)
  const trend = entries.slice(0, 10).reverse()
  const avg = roundTo1(trend.reduce((sum, e) => sum + e.percentage, 0) / trend.length)

  return (
    <section aria-labelledby="history-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="history-title" className="text-lg font-semibold">
          Tus últimos intentos
        </h2>
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>Promedio: {avg} %</span>
          <span className="flex gap-1" aria-label={`Tendencia de los últimos ${trend.length} intentos`}>
            {trend.map((e) => (
              <span
                key={e.id}
                title={`${e.percentage} % · ${e.passed ? 'aprobado' : 'desaprobado'}`}
                className={`h-2.5 w-2.5 rounded-full ${e.passed ? 'bg-success' : 'bg-danger'}`}
              />
            ))}
          </span>
        </div>
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {recent.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{e.mode === 'exam' ? 'Simulacro' : 'Práctica'}</p>
              <p className="text-sm text-text-muted">
                {formatDate(e.date)}
                {e.revealedCount > 0 && ` · ${e.revealedCount} vistas`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono tabular-nums">
                {e.correct}/{e.total} · {e.percentage} %
              </p>
              <p className={`text-sm font-semibold ${e.passed ? 'text-success' : 'text-danger'}`}>
                {e.passed ? 'Aprobado' : 'Desaprobado'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
