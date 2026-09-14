import { useAppStore } from '../stores/appStore'
import type { Mistake } from '../types'
import { uid } from './helpers'

export function recordMistake(input: Omit<Mistake, 'id' | 'at' | 'resolved'> & { resolved?: boolean }) {
  const entry: Mistake = {
    id: uid('err'),
    at: new Date().toISOString(),
    resolved: false,
    ...input,
  }
  const mistakes = [entry, ...useAppStore.getState().mistakes].slice(0, 300)
  useAppStore.getState().setMistakes(mistakes)
  return entry
}

export function resolveMistakesForExercise(exerciseId: string) {
  const mistakes = useAppStore.getState().mistakes.map((m) =>
    m.exerciseId === exerciseId ? { ...m, resolved: true } : m,
  )
  useAppStore.getState().setMistakes(mistakes)
}

export function openMistakes(limit = 20) {
  return useAppStore.getState().mistakes.filter((m) => !m.resolved).slice(0, limit)
}

export function mistakesByTopic() {
  const map: Record<string, number> = {}
  for (const m of openMistakes(100)) map[m.topic] = (map[m.topic] || 0) + 1
  return map
}
