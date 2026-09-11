export type Topic =
  | 'seguridad-vial'
  | 'movilidad-sustentable'
  | 'responsabilidad-legal'
  | 'prioridades'
  | 'luces'
  | 'velocidad'
  | 'maniobras'
  | 'autopistas-y-condiciones-adversas'
  | 'estacionamiento'
  | 'capacidad-natural'
  | 'actitud'
  | 'seguridad-vehicular'
  | 'senales'

export interface QuestionSource {
  /** 'B' = Manual de conducción de vehículos urbanos de cuatro ruedas. 'A' = manual motovehicular (fase 2). */
  manual: 'B' | 'A'
  /** Capítulo o anexo y sección, tal como figura en el índice del manual. */
  chapter: string
  /** Número de página impreso en el manual. */
  page?: number
}

export interface Question {
  /** Estable, ej. "b-sen-014". */
  id: string
  topic: Topic
  text: string
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
  explanation: string
  source: QuestionSource
  image?: string
}
