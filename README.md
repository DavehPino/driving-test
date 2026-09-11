# Manejo CABA

App de práctica para el examen teórico de licencia de conducir (categoría B) de la Ciudad Autónoma de Buenos Aires.

El prompt de arranque con todos los requisitos está en [`PROMPT.md`](./PROMPT.md).

## Qué hace

- **Simulacro de examen**: 40 preguntas al azar, 45 minutos, sin ayudas. Se aprueba con 34 correctas (85 %), igual que el examen real.
- **Práctica**: 10, 20 o 40 preguntas, con filtro por tema y feedback inmediato.
- **Mostrar respuestas**: checkbox previo al inicio que agrega un botón "Ver respuesta" con un modal (respuesta correcta, explicación y página del manual). Las preguntas vistas no cuentan para el puntaje.
- **Resultado**: puntaje, aprobado/desaprobado, desglose por tema, repaso de errores y "Repetir solo las que fallé".
- **Historial** local de intentos (localStorage).

## Banco de preguntas

`src/data/questions.ts` tiene 188 preguntas derivadas del
[Manual teórico de conducción de vehículos urbanos de cuatro ruedas (GCBA, 2023)](https://buenosaires.gob.ar/sites/default/files/2024-11/MANUAL_Vehiculo_4Ruedas_2023%20SA.pdf),
el material oficial de categoría B. Cada pregunta cita capítulo y página impresa del manual.
`src/data/questions.test.ts` valida el esquema de todo el banco.

## Stack

- Vite + React 19 + TypeScript (SPA)
- Tailwind CSS v4 (`@tailwindcss/vite`), tema oscuro único definido en `src/index.css`
- react-router-dom, zustand
- Vitest + Testing Library
- Deploy: Vercel (estático, rewrite SPA en `vercel.json`)
- Node 22 (`.nvmrc`)

## Scripts

```sh
npm run dev      # servidor local
npm run build    # tsc + vite build → dist/
npm test         # vitest run
npm run lint     # oxlint
```

## Deploy en Vercel

Opción A, desde la web: subir el repo a GitHub e importarlo en Vercel. Detecta Vite solo (build `npm run build`, output `dist`).

Opción B, desde la terminal:

```sh
npx vercel login
npx vercel --prod
```
