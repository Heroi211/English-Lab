import { clamp } from './helpers'

export const BANDS = [
  { min: 0, max: 39, label: 'Weak' },
  { min: 40, max: 59, label: 'Developing' },
  { min: 60, max: 74, label: 'Familiar' },
  { min: 75, max: 89, label: 'Strong' },
  { min: 90, max: 100, label: 'Mastered' },
]

export function bandFor(score: number) {
  const s = clamp(score)
  return BANDS.find((b) => s >= b.min && s <= b.max) || BANDS[0]
}

export function updateMasteryScore(current: number | undefined, { correct, weight = 1 }: { correct: boolean; weight?: number }) {
  const base = typeof current === 'number' ? current : 35
  return clamp(base + (correct ? 10 * weight : -8 * weight))
}

export function averageMastery(masteryMap: Record<string, number>) {
  const values = Object.values(masteryMap || {})
  if (!values.length) return 0
  return clamp(values.reduce((a, b) => a + b, 0) / values.length)
}
