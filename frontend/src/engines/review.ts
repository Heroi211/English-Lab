import { useAppStore } from '../stores/appStore'
import type { ReviewItem } from '../types'
import { todayISO } from './helpers'

const INTERVALS = [1, 2, 5, 10, 30]

function daysFromNow(days: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function upsertReviewItem(partial: Pick<ReviewItem, 'itemId' | 'kind' | 'topic' | 'label'>) {
  const queue = [...useAppStore.getState().reviewQueue]
  const idx = queue.findIndex((q) => q.itemId === partial.itemId)
  const base: ReviewItem = {
    ...partial,
    dueAt: daysFromNow(1),
    intervalIndex: 0,
    streakCorrect: 0,
  }
  if (idx >= 0) queue[idx] = { ...queue[idx], ...partial }
  else queue.push(base)
  useAppStore.getState().setReviewQueue(queue)
  return base
}

export function scheduleAfterAnswer(itemId: string, correct: boolean) {
  const queue = useAppStore.getState().reviewQueue.map((item) => {
    if (item.itemId !== itemId) return item
    if (!correct) {
      return { ...item, intervalIndex: 0, streakCorrect: 0, dueAt: daysFromNow(INTERVALS[0]) }
    }
    const nextIdx = Math.min((item.intervalIndex || 0) + 1, INTERVALS.length - 1)
    return {
      ...item,
      intervalIndex: nextIdx,
      streakCorrect: (item.streakCorrect || 0) + 1,
      dueAt: daysFromNow(INTERVALS[nextIdx]),
    }
  })
  useAppStore.getState().setReviewQueue(queue)
}

export function dueReviews(today = todayISO()) {
  return useAppStore
    .getState()
    .reviewQueue.filter((q) => q.dueAt <= today)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export function overdueCount() {
  return dueReviews().length
}
