interface ProgressBarProps {
  /** Posición actual, base 1. */
  current: number
  total: number
  answered: number
}

export function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">
          Pregunta {current} de {total}
        </span>
        <span className="text-text-muted">{answered} respondidas</span>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso del intento"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
      >
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
