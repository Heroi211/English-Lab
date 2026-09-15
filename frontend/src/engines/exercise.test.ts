import { describe, it, expect } from 'vitest'
import { validateAnswer } from './exercise'
import { updateMasteryScore, bandFor } from './mastery'
import { clamp } from './helpers'

describe('exercise validation', () => {
  it('validates multiple choice', () => {
    const fb = validateAnswer(
      {
        id: 'ex1',
        type: 'multiple_choice',
        level: 'A1',
        topic: 'verb_to_be',
        question: 'I ___ a student.',
        options: ['am', 'is'],
        answer: 'am',
        explanation: 'I takes am',
      },
      'am',
    )
    expect(fb.correct).toBe(true)
  })

  it('validates matching', () => {
    const fb = validateAnswer(
      {
        id: 'ex2',
        type: 'matching',
        level: 'A1',
        topic: 'verb_to_be',
        question: 'Match',
        pairs: [
          { left: 'I', right: 'am' },
          { left: 'She', right: 'is' },
        ],
        explanation: 'pattern',
      },
      { I: 'am', She: 'is' },
    )
    expect(fb.correct).toBe(true)
  })

  it('validates ordering against correctOrder/answer, not shuffled items', () => {
    const fb = validateAnswer(
      {
        id: 'ex3',
        type: 'ordering',
        level: 'A1',
        topic: 'word_order',
        question: 'Order',
        items: ['am', 'I', 'student', 'a'],
        correctOrder: ['I', 'am', 'a', 'student'],
        answer: ['I', 'am', 'a', 'student'],
        explanation: 'SVO',
      },
      ['I', 'am', 'a', 'student'],
    )
    expect(fb.correct).toBe(true)
    expect(fb.expected).toEqual(['I', 'am', 'a', 'student'])

    const wrong = validateAnswer(
      {
        id: 'ex3b',
        type: 'ordering',
        level: 'A1',
        topic: 'word_order',
        question: 'Order',
        items: ['am', 'I', 'student', 'a'],
        answer: ['I', 'am', 'a', 'student'],
        explanation: 'SVO',
      },
      ['am', 'I', 'student', 'a'],
    )
    expect(wrong.correct).toBe(false)
  })
})

describe('mastery', () => {
  it('clamps and bands', () => {
    expect(clamp(150)).toBe(100)
    expect(bandFor(92).label).toBe('Mastered')
    expect(updateMasteryScore(40, { correct: true })).toBeGreaterThan(40)
    expect(updateMasteryScore(40, { correct: false })).toBeLessThan(40)
  })
})
