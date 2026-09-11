import { QUESTIONS } from '../data/questions'
import type { Question, Topic } from '../data/types'
import { sample } from './shuffle'

const byId = new Map<string, Question>(QUESTIONS.map((q) => [q.id, q]))

export function getQuestion(id: string): Question | undefined {
  return byId.get(id)
}

/** Resuelve ids a preguntas, descartando las que ya no existen en el banco. */
export function resolveQuestions(ids: readonly string[]): Question[] {
  return ids.map((id) => byId.get(id)).filter((q): q is Question => q !== undefined)
}

export function countByTopic(topics: readonly Topic[]): number {
  if (topics.length === 0) return QUESTIONS.length
  return QUESTIONS.filter((q) => topics.includes(q.topic)).length
}

/** Elige `count` preguntas al azar, opcionalmente filtradas por tema. */
export function pickQuestionIds(count: number, topics: readonly Topic[] = [], seed?: number): string[] {
  const pool = topics.length === 0 ? QUESTIONS : QUESTIONS.filter((q) => topics.includes(q.topic))
  return sample(pool, count, seed).map((q) => q.id)
}

export function formatSource(q: Question): string {
  const manual =
    q.source.manual === 'B'
      ? 'Manual de conducción de vehículos urbanos de cuatro ruedas'
      : 'Manual de conducción motovehicular'
  const page = q.source.page !== undefined ? `, pág. ${q.source.page}` : ''
  return `Fuente: ${manual}, ${q.source.chapter}${page}`
}
