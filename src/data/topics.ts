import type { Topic } from './types'

/** Temas en el orden en que aparecen en el manual oficial de categoría B. */
export const TOPICS: { id: Topic; label: string; chapter: string }[] = [
  { id: 'seguridad-vial', label: 'Seguridad y cultura vial', chapter: 'Introducción' },
  { id: 'movilidad-sustentable', label: 'Movilidad sustentable', chapter: 'Capítulo 1' },
  { id: 'responsabilidad-legal', label: 'Responsabilidad y documentación', chapter: 'Capítulo 2' },
  { id: 'prioridades', label: 'Prioridades de paso', chapter: 'Capítulo 3' },
  { id: 'luces', label: 'Uso de luces', chapter: 'Capítulo 3' },
  { id: 'velocidad', label: 'Velocidad', chapter: 'Capítulo 3' },
  { id: 'maniobras', label: 'Giros, adelantamiento y sobrepaso', chapter: 'Capítulo 3' },
  { id: 'autopistas-y-condiciones-adversas', label: 'Autopistas y situaciones adversas', chapter: 'Capítulo 3' },
  { id: 'estacionamiento', label: 'Detención y estacionamiento', chapter: 'Capítulo 3' },
  { id: 'capacidad-natural', label: 'Alcohol, drogas, fatiga y distracciones', chapter: 'Capítulo 4' },
  { id: 'actitud', label: 'Actitud al conducir', chapter: 'Capítulo 5' },
  { id: 'seguridad-vehicular', label: 'Elementos de seguridad del vehículo', chapter: 'Anexo I' },
  { id: 'senales', label: 'Señales viales', chapter: 'Anexo IV' },
]

export const TOPIC_LABEL: Record<Topic, string> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t.label]),
) as Record<Topic, string>
