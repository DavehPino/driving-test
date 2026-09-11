import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Topic } from '../data/types'
import { pickQuestionIds, resolveQuestions } from '../lib/bank'
import {
  computeScore,
  EXAM_MINUTES,
  EXAM_QUESTIONS,
  isCorrect,
  type AnswerIndex,
  type Answers,
  type Revealed,
} from '../lib/scoring'
import { useHistory } from './history'

export type Mode = 'exam' | 'practice'

export interface AttemptConfig {
  mode: Mode
  /** Cantidad de preguntas. En simulacro se ignora y se usan 40. */
  count: number
  /** Filtro de temas para práctica. Vacío = todos. */
  topics: Topic[]
  /** Habilita el botón "Ver respuesta". Siempre false en simulacro. */
  showAnswers: boolean
}

export interface Attempt {
  id: string
  config: AttemptConfig
  mode: Mode
  showAnswers: boolean
  questionIds: string[]
  index: number
  answers: Answers
  revealed: Revealed
  startedAt: number
  /** Epoch ms en que vence el tiempo. Solo en simulacro. */
  deadline: number | null
  finished: boolean
  finishedAt: number | null
}

interface AttemptState {
  attempt: Attempt | null
  start: (config: AttemptConfig, questionIds?: string[]) => void
  restart: () => void
  answer: (questionId: string, option: AnswerIndex) => void
  reveal: (questionId: string) => void
  goTo: (index: number) => void
  next: () => void
  prev: () => void
  skip: () => void
  finish: () => void
  retryWrong: () => void
  clear: () => void
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function normalize(config: AttemptConfig): AttemptConfig {
  return config.mode === 'exam'
    ? { mode: 'exam', count: EXAM_QUESTIONS, topics: [], showAnswers: false }
    : config
}

function createAttempt(config: AttemptConfig, questionIds?: string[]): Attempt {
  const cfg = normalize(config)
  const ids = questionIds ?? pickQuestionIds(cfg.count, cfg.topics)
  const now = Date.now()
  return {
    id: newId(),
    config: cfg,
    mode: cfg.mode,
    showAnswers: cfg.showAnswers,
    questionIds: ids,
    index: 0,
    answers: {},
    revealed: {},
    startedAt: now,
    deadline: cfg.mode === 'exam' ? now + EXAM_MINUTES * 60_000 : null,
    finished: false,
    finishedAt: null,
  }
}

/** Ids de preguntas incorrectas, sin responder o reveladas de un intento. */
export function wrongQuestionIds(attempt: Attempt): string[] {
  return resolveQuestions(attempt.questionIds)
    .filter((q) => attempt.revealed[q.id] || !isCorrect(q, attempt.answers))
    .map((q) => q.id)
}

export const useAttempt = create<AttemptState>()(
  persist(
    (set, get) => {
      const update = (fn: (a: Attempt) => Partial<Attempt> | null) => {
        const a = get().attempt
        if (!a || a.finished) return
        const patch = fn(a)
        if (patch) set({ attempt: { ...a, ...patch } })
      }

      return {
        attempt: null,

        start: (config, questionIds) => set({ attempt: createAttempt(config, questionIds) }),

        restart: () => {
          const a = get().attempt
          if (a) set({ attempt: createAttempt(a.config) })
        },

        answer: (questionId, option) =>
          update((a) => {
            // En práctica la respuesta queda bloqueada al elegirla (hay feedback inmediato).
            if (a.mode === 'practice' && a.answers[questionId] !== undefined) return null
            return { answers: { ...a.answers, [questionId]: option } }
          }),

        reveal: (questionId) =>
          update((a) => (a.showAnswers ? { revealed: { ...a.revealed, [questionId]: true } } : null)),

        goTo: (index) =>
          update((a) => ({ index: Math.min(Math.max(index, 0), a.questionIds.length - 1) })),

        next: () => get().goTo((get().attempt?.index ?? 0) + 1),
        prev: () => get().goTo((get().attempt?.index ?? 0) - 1),
        skip: () => get().next(),

        finish: () => {
          const a = get().attempt
          if (!a || a.finished) return
          const finishedAt = Date.now()
          set({ attempt: { ...a, finished: true, finishedAt } })
          const score = computeScore(resolveQuestions(a.questionIds), a.answers, a.revealed)
          useHistory.getState().add({
            id: a.id,
            date: new Date(finishedAt).toISOString(),
            mode: a.mode,
            correct: score.correct,
            total: score.total,
            percentage: score.percentage,
            passed: score.passed,
            revealedCount: score.revealedCount,
          })
        },

        retryWrong: () => {
          const a = get().attempt
          if (!a) return
          const ids = wrongQuestionIds(a)
          if (ids.length === 0) return
          const config: AttemptConfig = {
            mode: 'practice',
            count: ids.length,
            topics: [],
            showAnswers: a.mode === 'practice' && a.showAnswers,
          }
          set({ attempt: createAttempt(config, ids) })
        },

        clear: () => set({ attempt: null }),
      }
    },
    {
      name: 'manejo-caba:attempt',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      partialize: (s) => ({ attempt: s.attempt }),
      // Si el banco cambió entre sesiones, descartamos ids que ya no existen.
      merge: (persisted, current) => {
        const attempt = (persisted as Partial<AttemptState> | undefined)?.attempt ?? null
        if (!attempt) return current
        const ids = resolveQuestions(attempt.questionIds).map((q) => q.id)
        if (ids.length === 0) return current
        return {
          ...current,
          attempt: { ...attempt, questionIds: ids, index: Math.min(attempt.index, ids.length - 1) },
        }
      },
    },
  ),
)
