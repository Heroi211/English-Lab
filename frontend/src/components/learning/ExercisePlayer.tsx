import { useMemo, useState } from 'react'
import type { Exercise } from '../../types'
import { validateAnswer, type Feedback } from '../../engines/exercise'
import { updateMasteryScore } from '../../engines/mastery'
import { recordMistake, resolveMistakesForExercise } from '../../engines/mistakes'
import { scheduleAfterAnswer, upsertReviewItem } from '../../engines/review'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import clsx from 'clsx'

export function ExercisePlayer({
  exercises,
  onComplete,
}: {
  exercises: Exercise[]
  onComplete?: (results: Feedback[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Feedback[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const patchMastery = useAppStore((s) => s.patchMastery)
  const touchStreak = useAppStore((s) => s.touchStreak)
  const mastery = useAppStore((s) => s.progress.mastery)
  const setProgress = useAppStore((s) => s.setProgress)
  const history = useAppStore((s) => s.progress.exerciseHistory)

  const done = index >= exercises.length
  const exercise = exercises[index]

  function apply(fb: Feedback) {
    const current = mastery[fb.topic] ?? 40
    patchMastery(fb.topic, updateMasteryScore(current, { correct: fb.correct }))
    upsertReviewItem({ itemId: fb.exerciseId, kind: 'exercise', topic: fb.topic, label: fb.exerciseId })
    scheduleAfterAnswer(fb.exerciseId, fb.correct)
    setProgress({ exerciseHistory: [...history, { ...fb, at: new Date().toISOString() }].slice(-200) })
    touchStreak()
    if (!fb.correct) {
      recordMistake({
        exerciseId: fb.exerciseId,
        topic: fb.topic,
        ruleId: fb.ruleId,
        userAnswer: fb.userAnswer,
        correctAnswer: fb.expected,
        source: 'exercise',
      })
    } else resolveMistakesForExercise(fb.exerciseId)
  }

  if (!exercises.length) {
    return <p className="font-mono text-sm text-zinc-600">No exercises available.</p>
  }

  if (done) {
    const correct = results.filter((r) => r.correct).length
    return (
      <div className="space-y-4">
        <Badge>Session complete</Badge>
        <h2 className="text-2xl font-semibold">
          Score: {correct} / {results.length}
        </h2>
        <p className="text-zinc-500">Accuracy {results.length ? Math.round((correct / results.length) * 100) : 0}%</p>
        <Button onClick={() => onComplete?.(results)}>Continue</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Badge>
          Exercise {index + 1} / {exercises.length}
        </Badge>
        <span className="font-mono text-xs text-zinc-600">
          {exercise.type} · {exercise.topic}
        </span>
      </div>
      <h2 className="text-xl font-semibold leading-snug">{exercise.question}</h2>
      <ExerciseInput
        key={exercise.id}
        exercise={exercise}
        disabled={!!feedback}
        onSubmit={(answer) => {
          const fb = validateAnswer(exercise, answer)
          apply(fb)
          setFeedback(fb)
          setResults((r) => [...r, fb])
        }}
      />
      {feedback && (
        <div
          className={clsx(
            'space-y-2 rounded-lg border p-4',
            feedback.correct ? 'border-teal-900 bg-teal-950/30' : 'border-red-900/60 bg-red-950/20',
          )}
        >
          <p className="font-medium">{feedback.correct ? 'Correct' : 'Not quite'}</p>
          <p className="text-sm text-zinc-400">
            Your answer: <span className="font-mono text-zinc-200">{formatVal(feedback.userAnswer)}</span>
          </p>
          <p className="text-sm text-zinc-400">
            Correct: <span className="font-mono text-zinc-200">{formatVal(feedback.expected)}</span>
          </p>
          <p className="text-sm text-zinc-300">{feedback.explanation}</p>
          <Button
            onClick={() => {
              setFeedback(null)
              setIndex((i) => i + 1)
            }}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}

function formatVal(v: unknown) {
  if (typeof v === 'boolean') return v ? 'True' : 'False'
  if (v && typeof v === 'object') return JSON.stringify(v)
  return String(v ?? '')
}

function ExerciseInput({
  exercise,
  onSubmit,
  disabled,
}: {
  exercise: Exercise
  onSubmit: (a: unknown) => void
  disabled?: boolean
}) {
  const [choice, setChoice] = useState('')
  const [text, setText] = useState('')
  const [match, setMatch] = useState<Record<string, string>>({})
  const [order, setOrder] = useState<string[]>(() =>
    shuffle([...(exercise.items || exercise.correctOrder || (Array.isArray(exercise.answer) ? exercise.answer : []) || [])]),
  )

  const rights = useMemo(() => shuffle([...(exercise.pairs || []).map((p) => p.right)]), [exercise.id])

  if (exercise.type === 'multiple_choice' || exercise.type === 'true_false') {
    const options =
      exercise.type === 'true_false' ? ['true', 'false'] : exercise.options || []
    return (
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={String(o)}
            className={clsx(
              'flex cursor-pointer items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm hover:border-teal-800',
              choice === String(o) && 'border-teal-700',
            )}
          >
            <input
              type="radio"
              name={exercise.id}
              disabled={disabled}
              checked={choice === String(o)}
              onChange={() => setChoice(String(o))}
            />
            <span>{exercise.type === 'true_false' ? (o === 'true' ? 'True' : 'False') : o}</span>
          </label>
        ))}
        <Button
          disabled={disabled || !choice}
          onClick={() => onSubmit(exercise.type === 'true_false' ? choice === 'true' : choice)}
        >
          Check answer
        </Button>
      </div>
    )
  }

  if (exercise.type === 'matching') {
    return (
      <div className="space-y-3">
        {(exercise.pairs || []).map((p) => (
          <div key={p.left} className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-zinc-800 px-3 py-2 text-sm">{p.left}</div>
            <select
              disabled={disabled}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={match[p.left] || ''}
              onChange={(e) => setMatch({ ...match, [p.left]: e.target.value })}
            >
              <option value="">—</option>
              {rights.map((r) => (
                <option key={r + p.left} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Button disabled={disabled} onClick={() => onSubmit(match)}>
          Check answer
        </Button>
      </div>
    )
  }

  if (exercise.type === 'ordering') {
    return (
      <div className="space-y-3">
        <p className="font-mono text-xs text-zinc-600">Click items to build the correct order</p>
        <div className="flex flex-wrap gap-2">
          {order.map((item, i) => (
            <button
              key={item + i}
              type="button"
              disabled={disabled}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-teal-300"
              onClick={() => {
                const next = [...order]
                if (i === 0) next.push(next.shift()!)
                else {
                  const [x] = next.splice(i, 1)
                  next.unshift(x)
                }
                setOrder(next)
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-400">Current: {order.join(' → ')}</p>
        <Button disabled={disabled} onClick={() => onSubmit(order)}>
          Check answer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Input disabled={disabled} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer" />
      <Button disabled={disabled || !text.trim()} onClick={() => onSubmit(text)}>
        Check answer
      </Button>
    </div>
  )
}

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
