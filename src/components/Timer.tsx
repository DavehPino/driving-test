import { useEffect, useRef, useState } from 'react'
import { formatRemaining } from '../lib/format'

interface TimerProps {
  /** Epoch ms en que vence el tiempo. */
  deadline: number
  onExpire: () => void
}

const WARNING_MS = 5 * 60_000

export function Timer({ deadline, onExpire }: TimerProps) {
  const [now, setNow] = useState(() => Date.now())
  const onExpireRef = useRef(onExpire)
  const expiredRef = useRef(false)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remaining = deadline - now

  useEffect(() => {
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true
      onExpireRef.current()
    }
  }, [remaining])

  const warning = remaining < WARNING_MS
  return (
    <div
      role="timer"
      aria-label="Tiempo restante"
      className={`rounded-lg border px-3 py-1.5 font-mono text-lg tabular-nums transition-colors duration-150 ease-out ${
        warning ? 'border-danger text-danger' : 'border-border text-info'
      }`}
    >
      {formatRemaining(remaining)}
    </div>
  )
}
