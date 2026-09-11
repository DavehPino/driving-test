import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { getQuestion } from './lib/bank'
import { useAttempt } from './store/attempt'
import { useHistory } from './store/history'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

function currentQuestion() {
  const a = useAttempt.getState().attempt!
  return getQuestion(a.questionIds[a.index])!
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  useAttempt.setState({ attempt: null })
  useHistory.setState({ entries: [] })
})

describe('checkbox "Mostrar respuestas"', () => {
  it('con el checkbox activo, "Ver respuesta" abre un modal con la explicación', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('checkbox', { name: /mostrar respuestas/i }))
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    await user.click(screen.getByRole('button', { name: 'Ver respuesta' }))
    const dialog = screen.getByRole('dialog', { name: 'Respuesta correcta' })
    const q = currentQuestion()
    expect(within(dialog).getByText(q.explanation)).toBeInTheDocument()
    expect(within(dialog).getByText(q.options[q.correctIndex])).toBeInTheDocument()
    expect(useAttempt.getState().attempt!.revealed[q.id]).toBe(true)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('después de responder, "Ver respuesta" desaparece para no anular un acierto', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('checkbox', { name: /mostrar respuestas/i }))
    await user.click(screen.getByRole('button', { name: 'Empezar' }))
    const q = currentQuestion()
    await user.click(within(screen.getByRole('group', { name: 'Opciones' })).getAllByRole('button')[q.correctIndex])

    expect(screen.queryByRole('button', { name: 'Ver respuesta' })).not.toBeInTheDocument()
    expect(useAttempt.getState().attempt!.revealed[q.id]).toBeUndefined()
  })

  it('con el checkbox inactivo, el botón "Ver respuesta" no existe', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(screen.getByRole('checkbox', { name: /mostrar respuestas/i })).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver respuesta' })).not.toBeInTheDocument()
  })

  it('en modo simulacro el checkbox está deshabilitado', async () => {
    const user = userEvent.setup()
    renderApp()

    const checkbox = screen.getByRole('checkbox', { name: /mostrar respuestas/i })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /simulacro de examen/i }))
    expect(checkbox).toBeDisabled()
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText(/el examen real no tiene ayudas/i)).toBeInTheDocument()
  })
})

describe('flujo completo', () => {
  it('el simulacro arranca con cronómetro y sin botón de ayuda', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('radio', { name: /simulacro de examen/i }))
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    expect(screen.getByRole('timer')).toHaveTextContent('45:00')
    expect(screen.queryByRole('button', { name: 'Ver respuesta' })).not.toBeInTheDocument()
  })

  it('una pregunta revelada se excluye del puntaje y el resultado lo aclara', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('checkbox', { name: /mostrar respuestas/i }))
    await user.click(screen.getByRole('button', { name: 'Empezar' }))
    await user.click(screen.getByRole('button', { name: 'Ver respuesta' }))
    await user.click(screen.getByRole('button', { name: 'Entendido' }))

    await user.click(screen.getByRole('button', { name: 'Terminar' }))
    const dialog = screen.getByRole('dialog', { name: /terminar el intento/i })
    await user.click(within(dialog).getByRole('button', { name: 'Terminar' }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/APROBADO|DESAPROBADO/)
    expect(screen.getByText(/viste la respuesta de 1 pregunta/i)).toBeInTheDocument()
    expect(useHistory.getState().entries).toHaveLength(1)
    expect(useHistory.getState().entries[0].revealedCount).toBe(1)
  })

  it('en práctica, responder muestra feedback inmediato', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Empezar' }))

    const q = currentQuestion()
    await user.keyboard(String(q.correctIndex + 1))
    expect(screen.getByRole('status')).toHaveTextContent('¡Correcto!')
    expect(screen.getByRole('status')).toHaveTextContent(q.explanation)
  })

  it('sin intento en curso, /quiz redirige al inicio', () => {
    renderApp('/quiz')
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument()
  })
})
