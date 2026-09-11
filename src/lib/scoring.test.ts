import type { Question, Topic } from '../data/types'
import { computeScore, passThreshold, type Answers, type Revealed } from './scoring'

function makeQuestions(n: number, topic: Topic = 'prioridades'): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q-${i}`,
    topic,
    text: `Pregunta ${i}`,
    options: ['a', 'b', 'c'],
    correctIndex: 0,
    explanation: 'x',
    source: { manual: 'B', chapter: 'Cap. 3' },
  }))
}

/** Responde bien las primeras `correct` preguntas y mal el resto. */
function answer(questions: Question[], correct: number): Answers {
  return Object.fromEntries(questions.map((q, i) => [q.id, i < correct ? 0 : 1]))
}

describe('passThreshold', () => {
  it.each([
    [40, 34],
    [20, 17],
    [10, 9],
    [1, 1],
    [0, 0],
  ])('%i preguntas: mínimo %i', (total, expected) => {
    expect(passThreshold(total)).toBe(expected)
  })
})

describe('computeScore', () => {
  it('simulacro: 34 de 40 aprueba', () => {
    const qs = makeQuestions(40)
    const s = computeScore(qs, answer(qs, 34))
    expect(s).toMatchObject({ correct: 34, total: 40, threshold: 34, percentage: 85, passed: true })
  })

  it('simulacro: 33 de 40 desaprueba', () => {
    const qs = makeQuestions(40)
    const s = computeScore(qs, answer(qs, 33))
    expect(s).toMatchObject({ correct: 33, total: 40, percentage: 82.5, passed: false })
  })

  it('práctica: 9 de 10 aprueba', () => {
    const qs = makeQuestions(10)
    expect(computeScore(qs, answer(qs, 9)).passed).toBe(true)
  })

  it('práctica: 8 de 10 desaprueba', () => {
    const qs = makeQuestions(10)
    expect(computeScore(qs, answer(qs, 8)).passed).toBe(false)
  })

  it('las preguntas sin responder valen 0 sin penalizar', () => {
    const qs = makeQuestions(10)
    const answers: Answers = { 'q-0': 0, 'q-1': 0 }
    expect(computeScore(qs, answers)).toMatchObject({ correct: 2, answered: 2, total: 10 })
  })

  it('las reveladas no suman al score y se cuentan aparte', () => {
    const qs = makeQuestions(10)
    const revealed: Revealed = { 'q-0': true, 'q-1': true }
    const s = computeScore(qs, answer(qs, 10), revealed)
    expect(s).toMatchObject({ correct: 8, total: 8, revealedCount: 2, threshold: 7, passed: true })
  })

  it('revelar respuestas no infla el resultado', () => {
    const qs = makeQuestions(10)
    // 8 correctas en total, pero 2 fueron reveladas: quedan 6 de 8 válidas.
    const s = computeScore(qs, answer(qs, 8), { 'q-0': true, 'q-1': true })
    expect(s).toMatchObject({ correct: 6, total: 8, passed: false })
  })

  it('sin preguntas válidas no aprueba', () => {
    const qs = makeQuestions(3)
    const s = computeScore(qs, answer(qs, 3), { 'q-0': true, 'q-1': true, 'q-2': true })
    expect(s).toMatchObject({ total: 0, percentage: 0, passed: false })
  })

  it('desglosa por tema', () => {
    const qs = [...makeQuestions(2, 'luces'), ...makeQuestions(3, 'velocidad')].map((q, i) => ({
      ...q,
      id: `t-${i}`,
    }))
    const s = computeScore(qs, { 't-0': 0, 't-2': 0, 't-3': 1 })
    expect(s.byTopic).toEqual([
      { topic: 'luces', correct: 1, total: 2 },
      { topic: 'velocidad', correct: 1, total: 3 },
    ])
  })
})
