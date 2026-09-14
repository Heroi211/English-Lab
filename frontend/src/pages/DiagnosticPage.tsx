import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useCurriculum } from '../hooks/useCurriculum'
import { validateAnswer } from '../engines/exercise'
import { useAppStore } from '../stores/appStore'
import { applyDiagnosticPlacement } from '../engines/progression'
import type { Exercise } from '../types'

export function DiagnosticPage() {
  const { data, loading, error } = useCurriculum()
  const setDiagnostic = useAppStore((s) => s.setDiagnostic)
  const navigate = useNavigate()
  const assessment = data?.assessments['diagnostic']
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; level: 'A1' | 'A2'; moduleId: string; lessonId: string } | null>(null)

  const questions = assessment?.questions || []

  const estimate = useMemo(() => {
    if (!questions.length) return null
    let score = 0
    const topicHits: Record<string, { ok: number; n: number }> = {}
    for (const q of questions) {
      const fb = validateAnswer(q, answers[q.id])
      if (fb.correct) score += 1
      const t = q.topic || 'general'
      topicHits[t] = topicHits[t] || { ok: 0, n: 0 }
      topicHits[t].n += 1
      if (fb.correct) topicHits[t].ok += 1
    }
    const ratio = score / questions.length
    let level: 'A1' | 'A2' = ratio >= 0.65 ? 'A2' : 'A1'
    let moduleId = level === 'A2' ? 'a2-m1' : 'a1-m1'
    let lessonId = level === 'A2' ? 'a2-m1-l1' : 'a1-m1-l1'
    if (level === 'A1' && ratio >= 0.45) {
      moduleId = 'a1-m3'
      lessonId = 'a1-m3-l1'
    } else if (level === 'A1' && ratio >= 0.3) {
      moduleId = 'a1-m2'
      lessonId = 'a1-m2-l1'
    }
    if (level === 'A2' && ratio < 0.8) {
      moduleId = 'a2-m1'
      lessonId = 'a2-m1-l1'
    }
    return { score, total: questions.length, level, moduleId, lessonId }
  }, [answers, questions, done])

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading diagnostic…</p>
  if (error) return <Card className="text-red-400">{error}</Card>
  if (!assessment) return <Card className="text-zinc-400">Diagnostic assessment not found yet. Curriculum may still be generating.</Card>

  if (done && result) {
    return (
      <Card className="mx-auto max-w-xl space-y-4">
        <Badge>Placement complete</Badge>
        <h1 className="text-2xl font-semibold">
          Estimated level: {result.level}
        </h1>
        <p className="text-zinc-500">
          Score {result.score}/{result.total}. Starting at {result.moduleId} / {result.lessonId}.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/learn/${result.lessonId}`)}>Start learning</Button>
          <Link to="/today">
            <Button variant="secondary">Today&apos;s Study</Button>
          </Link>
        </div>
      </Card>
    )
  }

  const q = questions[index] as Exercise | undefined
  if (!q) return null

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <p className="font-mono text-xs text-teal-400">DIAGNOSTIC</p>
        <h1 className="mt-3 text-3xl font-semibold">Placement test</h1>
        <p className="mt-2 text-zinc-500">~{questions.length} questions · A1/A2 mix. Do your best without help.</p>
      </header>
      <Card className="space-y-4">
        <Badge>
          {index + 1} / {questions.length}
        </Badge>
        <h2 className="text-xl font-semibold">{q.question}</h2>
        <QuestionUI
          q={q}
          onAnswer={(a) => {
            const nextAnswers = { ...answers, [q.id]: a }
            setAnswers(nextAnswers)
            if (index + 1 >= questions.length) {
              // finalize
              let score = 0
              for (const question of questions) {
                if (validateAnswer(question, nextAnswers[question.id]).correct) score += 1
              }
              const ratio = score / questions.length
              let level: 'A1' | 'A2' = ratio >= 0.65 ? 'A2' : 'A1'
              let moduleId = level === 'A2' ? 'a2-m1' : 'a1-m1'
              let lessonId = level === 'A2' ? 'a2-m1-l1' : 'a1-m1-l1'
              if (level === 'A1' && ratio >= 0.45) {
                moduleId = 'a1-m3'
                lessonId = 'a1-m3-l1'
              } else if (level === 'A1' && ratio >= 0.3) {
                moduleId = 'a1-m2'
                lessonId = 'a1-m2-l1'
              }
              const placement = { score, total: questions.length, level, moduleId, lessonId }
              applyDiagnosticPlacement(level, moduleId, lessonId)
              setDiagnostic({
                takenAt: new Date().toISOString(),
                estimatedLevel: level,
                moduleId,
                lessonId,
                score,
                total: questions.length,
              })
              setResult(placement)
              setDone(true)
            } else setIndex((i) => i + 1)
          }}
        />
      </Card>
      {/* silence unused */}
      <span className="hidden">{estimate?.score}</span>
    </div>
  )
}

function QuestionUI({ q, onAnswer }: { q: Exercise; onAnswer: (a: unknown) => void }) {
  const [text, setText] = useState('')
  if (q.type === 'multiple_choice') {
    return (
      <div className="space-y-2">
        {(q.options || []).map((o) => (
          <Button key={o} variant="secondary" className="w-full justify-start" onClick={() => onAnswer(o)}>
            {o}
          </Button>
        ))}
      </div>
    )
  }
  if (q.type === 'true_false') {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onAnswer(true)}>True</Button>
        <Button variant="secondary" onClick={() => onAnswer(false)}>False</Button>
      </div>
    )
  }
  return (
    <div className="flex gap-2">
      <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} />
      <Button onClick={() => onAnswer(text)}>Next</Button>
    </div>
  )
}
