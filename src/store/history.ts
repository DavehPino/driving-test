import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Mode } from './attempt'

export interface HistoryEntry {
  id: string
  /** Fecha ISO de finalización. */
  date: string
  mode: Mode
  correct: number
  total: number
  percentage: number
  passed: boolean
  revealedCount: number
}

export const HISTORY_LIMIT = 50

interface HistoryState {
  entries: HistoryEntry[]
  add: (entry: HistoryEntry) => void
  clear: () => void
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((s) =>
          s.entries.some((e) => e.id === entry.id)
            ? s
            : { entries: [entry, ...s.entries].slice(0, HISTORY_LIMIT) },
        ),
      clear: () => set({ entries: [] }),
    }),
    {
      name: 'manejo-caba:history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
