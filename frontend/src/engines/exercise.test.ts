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

  it('validates ordering', () => {
    const fb = validateAnswer(
      {
        id: 'ex3',
        type: 'ordering',
        level: 'A1',
        topic: 'word_order',
        question: 'Order',
        items: ['I', 'am', 'happy'],
        correctOrder: ['I', 'am', 'happy'],
        explanation: 'SVO',
      },
      ['I', 'am', 'happy'],
    )
    expect(fb.correct).toBe(true)
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
