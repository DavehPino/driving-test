/** Clases compartidas de botones. Tema oscuro, foco visible con el color primario. */
const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50'

export const btnPrimary = `${base} bg-primary text-primary-fg hover:bg-primary/90`
export const btnSecondary = `${base} border border-border bg-surface text-text hover:bg-surface-2`
export const btnGhost = `${base} text-text-muted hover:bg-surface-2 hover:text-text`
export const btnDanger = `${base} bg-danger text-bg hover:bg-danger/90`
