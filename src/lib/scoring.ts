import type { Question, Topic } from '../data/types'

/** Proporción mínima de respuestas correctas para aprobar (examen CABA desde 2022). */
export const PASS_RATIO = 0.85
/** Cantidad de preguntas del examen real. */
export const EXAM_QUESTIONS = 40
/** Tiempo máximo del examen real, en minutos. */
export const EXAM_MINUTES = 45

export type AnswerIndex = 0 | 1 | 2
export type Answers = Record<string, AnswerIndex>
export type Revealed = Record<string, boolean>

export interface TopicScore {
  topic: Topic
  correct: number
  total: number
}

export interface Score {
  /** Respuestas correctas entre las preguntas válidas (no reveladas). */
  correct: number
  /** Preguntas válidas para el score (excluye las reveladas). */
  total: number
  /** Preguntas válidas que tienen una respuesta elegida. */
  answered: number
  /** Preguntas cuya respuesta se vio en el modal. No cuentan para el score. */
  revealedCount: number
  /** correct / total * 100, redondeado a 1 decimal. */
  percentage: number
  /** Mínimo de correctas para aprobar: ceil(total * 0.85). */
  threshold: number
  passed: boolean
  byTopic: TopicScore[]
}

/** Umbral de aprobación para una cantidad de preguntas. 40 da 34. */
export function passThreshold(total: number): number {
  // El epsilon evita errores de coma flotante: 20 * 0.85 = 17.000000000000004.
  return Math.max(0, Math.ceil(total * PASS_RATIO - 1e-9))
}

export function roundTo1(n: number): number {
  return Math.round(n * 10) / 10
}

export function isCorrect(question: Question, answers: Answers): boolean {
  return answers[question.id] === question.correctIndex
}

export function computeScore(questions: Question[], answers: Answers, revealed: Revealed = {}): Score {
  const scored = questions.filter((q) => !revealed[q.id])
  const revealedCount = questions.length - scored.length
  const total = scored.length
  const correct = scored.filter((q) => isCorrect(q, answers)).length
  const answered = scored.filter((q) => answers[q.id] !== undefined).length
  const threshold = passThreshold(total)

  const topicMap = new Map<Topic, TopicScore>()
  for (const q of scored) {
    const entry = topicMap.get(q.topic) ?? { topic: q.topic, correct: 0, total: 0 }
    entry.total += 1
    if (isCorrect(q, answers)) entry.correct += 1
    topicMap.set(q.topic, entry)
  }

  return {
    correct,
    total,
    answered,
    revealedCount,
    percentage: total === 0 ? 0 : roundTo1((correct / total) * 100),
    threshold,
    passed: total > 0 && correct >= threshold,
    byTopic: [...topicMap.values()],
  }
}
