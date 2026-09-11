import { sample, shuffle } from './shuffle'

const items = Array.from({ length: 50 }, (_, i) => i)

describe('shuffle', () => {
  it('conserva todos los elementos y no muta el original', () => {
    const copy = [...items]
    const out = shuffle(items, 1)
    expect(items).toEqual(copy)
    expect([...out].sort((a, b) => a - b)).toEqual(items)
  })

  it('es reproducible con la misma seed', () => {
    expect(shuffle(items, 42)).toEqual(shuffle(items, 42))
    expect(shuffle(items, 42)).not.toEqual(shuffle(items, 43))
  })
})

describe('sample', () => {
  it('devuelve n elementos distintos', () => {
    const out = sample(items, 10, 7)
    expect(out).toHaveLength(10)
    expect(new Set(out).size).toBe(10)
  })

  it('si pedís más de los disponibles, devuelve todos', () => {
    expect(sample([1, 2, 3], 40, 1)).toHaveLength(3)
  })
})
