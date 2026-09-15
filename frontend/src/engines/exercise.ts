import type { Exercise } from '../types'
import { normalizeAnswer } from './helpers'

export interface Feedback {
  correct: boolean
  userAnswer: unknown
  expected: unknown
  explanation: string
  ruleId?: string | null
  topic: string
  exerciseId: string
}

export function validateAnswer(exercise: Exercise, userAnswer: unknown): Feedback {
  let correct = false
  let expected: unknown = exercise.answer

  if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank' || exercise.type === 'error_correction') {
    const accepted = (exercise.answers || [exercise.answer]).map(normalizeAnswer)
    correct = accepted.includes(normalizeAnswer(userAnswer))
    expected = exercise.answer
  } else if (exercise.type === 'true_false') {
    const ua =
      typeof userAnswer === 'boolean'
        ? userAnswer
        : normalizeAnswer(userAnswer) === 'true' || normalizeAnswer(userAnswer) === 't'
    correct = ua === Boolean(exercise.answer)
    expected = Boolean(exercise.answer)
  } else if (exercise.type === 'matching') {
    const pairs = exercise.pairs || []
    const ua = (userAnswer && typeof userAnswer === 'object' ? userAnswer : {}) as Record<string, string>
    correct = pairs.every((p) => normalizeAnswer(ua[p.left]) === normalizeAnswer(p.right))
    expected = Object.fromEntries(pairs.map((p) => [p.left, p.right]))
  } else if (exercise.type === 'ordering') {
    const order = Array.isArray(userAnswer) ? userAnswer : []
    // Prefer explicit correct order / answer — never treat shuffled `items` as the key.
    const target = (
      exercise.correctOrder ||
      (Array.isArray(exercise.answer) ? exercise.answer : null) ||
      []
    ) as string[]
    correct =
      target.length > 0 &&
      order.length === target.length &&
      order.every((v, i) => normalizeAnswer(v) === normalizeAnswer(target[i]))
    expected = target
  } else {
    correct = normalizeAnswer(userAnswer) === normalizeAnswer(exercise.answer)
  }

  return {
    correct,
    userAnswer,
    expected,
    explanation: exercise.explanation || '',
    ruleId: exercise.ruleId,
    topic: exercise.topic || 'general',
    exerciseId: exercise.id,
  }
}

export function scoreSession(results: Feedback[]) {
  const total = results.length || 1
  const correct = results.filter((r) => r.correct).length
  return { correct, total, accuracy: Math.round((correct / total) * 100) }
}
