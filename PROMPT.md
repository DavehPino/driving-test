# Prompt de arranque — App de práctica para el examen teórico de manejo (CABA)

> Este archivo es el prompt inicial para generar la aplicación. Pegalo completo en el agente
> (Claude Code) junto con el repo ya scaffoldeado. Todo lo que está entre `[[ ]]` es una
> decisión abierta que el agente debe resolver con el criterio indicado o preguntar.

---

## 1. Objetivo

Construir una web app que ayude a personas a prepararse para el **examen teórico de la
licencia de conducir de la Ciudad Autónoma de Buenos Aires (CABA)**, tomado por la
**Dirección General de Licencias** del Gobierno de la Ciudad (GCBA) en las sedes comunales
habilitadas.

La app hace preguntas de opción múltiple basadas en el **material de estudio oficial** del
GCBA, permite practicar con o sin ayuda, y al terminar calcula un resultado con la misma
lógica que usa el examen real.

## 2. Fuente de verdad: documentación oficial

Las preguntas deben derivarse exclusivamente de estos documentos publicados por el GCBA:

| Documento | Uso | URL |
|---|---|---|
| Manual de conducción de vehículos urbanos de cuatro ruedas (2023) | Categoría B (autos). **Prioridad 1.** | https://buenosaires.gob.ar/sites/default/files/2024-11/MANUAL_Vehiculo_4Ruedas_2023%20SA.pdf |
| Manual de conducción motovehicular (2023) | Categoría A (motos). Fase 2. | https://buenosaires.gob.ar/sites/default/files/2024-11/MANUAL%20MOTO%202023%20SA.pdf |
| Página oficial de material de estudio | Índice de referencia | https://buenosaires.gob.ar/gcaba_historico/infraestructura/movilidad/curso-de-educacion-vial-para-otorgamiento-de-licencia/material-de-estudio-para-examen-teorico |

Reglas para el banco de preguntas:

- Cada pregunta lleva `source`: manual, capítulo/sección y, si es posible, página. Eso permite
  que el modal de respuesta muestre "dónde estudiar esto".
- Cada pregunta lleva `topic` de una lista cerrada que refleja los capítulos del manual, por
  ejemplo: `normativa`, `senalizacion`, `prioridades`, `velocidades`, `alcohol-y-drogas`,
  `seguridad-pasiva`, `documentacion`, `primeros-auxilios`, `conduccion-defensiva`,
  `estacionamiento`, `peatones-y-ciclistas`, `mecanica-basica`.
- Cada pregunta tiene **3 opciones y una sola correcta** (formato del examen real).
- Cada pregunta lleva `explanation`: 1 a 3 oraciones que expliquen por qué la correcta es
  correcta, citando el manual. Esto es lo que se muestra en el modal de ayuda.
- Banco inicial: **mínimo 120 preguntas** de categoría B, distribuidas de forma
  proporcional a la extensión de cada capítulo del manual. Las preguntas se escriben en
  español rioplatense, con voseo, y se guardan en `src/data/questions.ts` tipadas.
- No inventar normativa. Si un dato no está en el manual, no va como pregunta.

## 3. Reglas del examen real (para el simulador y el score)

Datos vigentes desde agosto de 2022 (reforma del GCBA):

| Parámetro | Valor |
|---|---|
| Cantidad de preguntas | 40 |
| Opciones por pregunta | 3, una correcta |
| Tiempo máximo | 45 minutos |
| Mínimo para aprobar | 85 % de respuestas correctas = **34 de 40** |
| Errores máximos permitidos | 6 |
| Penalización por respuesta incorrecta | No hay. Incorrecta y sin responder valen 0. |

Fórmula de score, implementada en un módulo puro y testeado (`src/lib/scoring.ts`):

```
correctas      = cantidad de respuestas correctas
total          = cantidad de preguntas del intento (40 en modo examen)
porcentaje     = round(correctas / total * 100, 1)
aprobado       = correctas >= ceil(total * 0.85)
```

Con `total = 40` esto da `ceil(34) = 34`, coincidiendo con el examen real. La fórmula se
mantiene proporcional para que el "modo práctica" con menos preguntas (10, 20) reporte
aprobado/desaprobado con el mismo umbral del 85 %.

La pantalla de resultado debe mostrar: correctas / total, porcentaje, APROBADO o
DESAPROBADO, el umbral (34/40), y un desglose por `topic` para que la persona sepa qué
capítulos repasar.

## 4. Funcionalidades (MVP)

### 4.1 Pantalla de inicio / configuración

- Selector de modo:
  - **Simulacro de examen**: 40 preguntas aleatorias, cronómetro de 45 min, sin ayudas.
  - **Práctica**: elegir cantidad (10 / 20 / 40) y opcionalmente filtrar por `topic`.
- **Checkbox "Mostrar respuestas durante la práctica"** (requisito clave):
  - Vive en la pantalla de configuración, antes de arrancar.
  - Cuando está activado, cada pregunta muestra un botón **"Ver respuesta"** que abre un
    **modal** con la opción correcta resaltada, la `explanation` y la referencia al manual.
  - Ver la respuesta marca esa pregunta como `revealed: true`. Esas preguntas cuentan como
    **no válidas para el score** (se muestran aparte en el resultado como "vistas") para que
    el porcentaje de aprobación no se infle. El resultado debe decirlo explícitamente.
  - En modo Simulacro el checkbox está deshabilitado con un tooltip explicando por qué.
- Botón principal "Empezar".

### 4.2 Pantalla de pregunta

- Barra de progreso (pregunta N de M) y, en simulacro, el tiempo restante.
- Enunciado, 3 opciones como botones grandes (accesibles con teclado: 1/2/3 y Enter).
- Al elegir una opción se bloquea la pregunta y se muestra feedback inmediato
  (correcto / incorrecto) en modo práctica. En modo simulacro no hay feedback hasta el final.
- Botón "Ver respuesta" (solo si el checkbox está activo) que abre el modal.
- Botón "Siguiente". Se puede "Saltar" en práctica; en simulacro saltar deja la pregunta
  sin responder.
- Si el cronómetro llega a cero, el intento se cierra automáticamente y se va al resultado.

### 4.3 Modal de respuesta

- Componente `AnswerModal` accesible: `role="dialog"`, `aria-modal`, foco atrapado, se
  cierra con Escape y con click fuera.
- Contenido: la opción correcta destacada, la explicación y "Fuente: Manual …, cap. X".

### 4.4 Pantalla de resultado

- Score según la fórmula de la sección 3.
- Lista de preguntas falladas con la respuesta correcta y la explicación.
- Desglose por `topic` (correctas / total por tema).
- Botones: "Repetir solo las que fallé", "Nuevo intento", "Volver al inicio".

### 4.5 Persistencia local

- Guardar en `localStorage` el historial de intentos (fecha, modo, score, aprobado) y
  mostrarlo en el inicio como "Tus últimos intentos" con una tendencia simple.
- Sin backend ni login en el MVP.

## 5. Diseño: paleta oscura

- **Tema oscuro por defecto y único en el MVP.** No hay toggle de tema.
- Tokens en `src/index.css` como variables CSS consumidas por Tailwind v4 (`@theme`):

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0B0F14` | fondo de página |
| `--color-surface` | `#151B23` | tarjetas, modal |
| `--color-surface-2` | `#1E2630` | hover, inputs |
| `--color-border` | `#2A3441` | bordes sutiles |
| `--color-text` | `#E6EDF3` | texto principal |
| `--color-text-muted` | `#8B98A5` | texto secundario |
| `--color-primary` | `#F5C518` | acción principal (amarillo "señal vial") |
| `--color-primary-fg` | `#0B0F14` | texto sobre primary |
| `--color-success` | `#3FB950` | correcto / aprobado |
| `--color-danger` | `#F85149` | incorrecto / desaprobado |
| `--color-info` | `#58A6FF` | links, tiempo restante |

- Contraste mínimo AA (4.5:1) en todo texto sobre fondo.
- Tipografía: sistema (`system-ui`), tamaños generosos. Es una app para leer y tocar en el
  celular: **mobile-first**, botones de opción de al menos 48 px de alto.
- Nada de gradientes ni decoración innecesaria. Foco visible en todos los controles.

## 6. Stack (ya scaffoldeado en este repo)

- **Vite + React 19 + TypeScript** (SPA, sin SSR: no hay datos dinámicos).
- **Tailwind CSS v4** vía `@tailwindcss/vite`.
- **react-router-dom** para las rutas `/`, `/quiz`, `/result`.
- **zustand** para el estado del intento (preguntas, respuestas, reveladas, timer).
- **Vitest + Testing Library** para tests. `npm test` debe pasar.
- Deploy en **Vercel** como sitio estático (`vercel.json` ya tiene el rewrite SPA).
- Node 22 (`.nvmrc`).

Estructura esperada:

```
src/
  data/questions.ts        # banco de preguntas tipado
  data/topics.ts           # lista cerrada de topics con label en español
  lib/scoring.ts           # fórmula de score, pura
  lib/scoring.test.ts
  lib/shuffle.ts           # selección aleatoria con seed opcional
  store/attempt.ts         # zustand: intento actual
  store/history.ts         # zustand + localStorage: historial
  components/AnswerModal.tsx
  components/QuestionCard.tsx
  components/ProgressBar.tsx
  components/Timer.tsx
  pages/Home.tsx
  pages/Quiz.tsx
  pages/Result.tsx
  App.tsx                  # router
```

Tipo base:

```ts
export type Topic = 'normativa' | 'senalizacion' | /* ... */ 'mecanica-basica'

export interface Question {
  id: string            // estable, ej. "b-sen-014"
  topic: Topic
  text: string
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
  explanation: string
  source: { manual: 'B' | 'A'; chapter: string; page?: number }
}
```

## 7. Criterios de aceptación

1. `npm run build` y `npm test` pasan sin errores ni warnings.
2. Con el checkbox activo, en cada pregunta hay un botón que abre un modal con la respuesta
   correcta y su explicación. Con el checkbox inactivo, el botón no existe.
3. Un simulacro con 34 correctas de 40 da APROBADO; con 33 da DESAPROBADO.
4. Una práctica de 10 preguntas con 9 correctas da APROBADO (9 ≥ ceil(8.5) = 9); con 8 da
   DESAPROBADO.
5. Las preguntas reveladas no suman al score y el resultado lo aclara.
6. El cronómetro de 45 min cierra el intento al llegar a 0.
7. Toda la UI es oscura, cumple contraste AA y se usa cómodamente a 375 px de ancho.
8. Cada pregunta del banco tiene `source` y `explanation` no vacíos (test automático).

## 8. Orden de trabajo sugerido para el agente

1. `lib/scoring.ts` + tests (criterios 3 y 4).
2. Tipos y `data/topics.ts`; banco inicial de 120 preguntas de categoría B leyendo el manual
   de cuatro ruedas. Test que valide el esquema (criterio 8).
3. Store del intento y selección aleatoria.
4. Pantallas Home → Quiz → Result, con el modal.
5. Historial en localStorage.
6. Pulido visual, accesibilidad, verificación mobile.
7. Deploy a Vercel.

## 9. Fuera de alcance (por ahora)

- Categoría A (motos) y A4: dejar el tipo `manual: 'A'` previsto pero sin preguntas.
- Login, sincronización entre dispositivos, backend.
- Preguntas con imágenes de señales. Se puede prever un campo opcional `image?: string`.
- Modo claro.
