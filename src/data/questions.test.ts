import { QUESTIONS } from './questions'
import { TOPICS } from './topics'

describe('banco de preguntas', () => {
  it('tiene al menos 120 preguntas', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(120)
  })

  it('tiene ids únicos', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(QUESTIONS.map((q) => [q.id, q] as const))('%s cumple el esquema', (_id, q) => {
    expect(q.text.trim()).not.toBe('')
    expect(q.explanation.trim()).not.toBe('')
    expect(q.source.chapter.trim()).not.toBe('')
    expect(q.source.page).toBeGreaterThan(0)
    expect(q.options).toHaveLength(3)
    q.options.forEach((o) => expect(o.trim()).not.toBe(''))
    expect(new Set(q.options).size).toBe(3)
    expect([0, 1, 2]).toContain(q.correctIndex)
    expect(TOPICS.map((t) => t.id)).toContain(q.topic)
  })

  it('cubre todos los temas', () => {
    const used = new Set(QUESTIONS.map((q) => q.topic))
    TOPICS.forEach((t) => expect(used).toContain(t.id))
  })

  it('reparte la respuesta correcta entre las tres posiciones', () => {
    const counts = [0, 0, 0]
    QUESTIONS.forEach((q) => counts[q.correctIndex]++)
    counts.forEach((c) => expect(c / QUESTIONS.length).toBeGreaterThan(0.15))
  })
})
