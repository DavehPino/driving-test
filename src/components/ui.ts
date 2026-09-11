/** Clases compartidas de botones. Tema oscuro, foco visible con el color primario. */

/** Feedback táctil al presionar: escala 0.96, interrumpible y desactivada cuando está deshabilitado. */
export const pressable =
  'transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out enabled:active:scale-[0.96]'

const base = `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 font-semibold ${pressable} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50`

export const btnPrimary = `${base} bg-primary text-primary-fg hover:bg-primary/90`
export const btnSecondary = `${base} bg-surface shadow-card text-text hover:bg-surface-2 hover:shadow-card-hover`
export const btnGhost = `${base} text-text-muted hover:bg-surface-2 hover:text-text`
export const btnDanger = `${base} bg-danger text-bg hover:bg-danger/90`
