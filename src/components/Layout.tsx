import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 rotate-45 items-center justify-center rounded-md border-2 border-primary-fg bg-primary"
          >
            <span className="-rotate-45 text-sm font-black text-primary-fg">B</span>
          </span>
          <div>
            <Link
              to="/"
              className="rounded text-lg font-bold leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Manejo CABA
            </Link>
            <p className="text-sm text-text-muted">Práctica para el examen teórico de conducir</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-2xl px-4 py-4 text-xs leading-relaxed text-text-muted">
          Preguntas basadas en el Manual de conducción de vehículos urbanos de cuatro ruedas (GCBA, 2023).
          Esta app no es oficial ni está vinculada al Gobierno de la Ciudad de Buenos Aires.
        </p>
      </footer>
    </div>
  )
}
