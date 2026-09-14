import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useCurriculum } from '../hooks/useCurriculum'
import { runAssessment } from '../engines/assessment'
import type { Exercise } from '../types'

export function AssessmentPage() {
  const { assessmentId = '' } = useParams()
  const { data, loading, error } = useCurriculum()
  const assessment = data?.assessments[assessmentId]
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<ReturnType<typeof runAssessment> | null>(null)

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading…</p>
  if (error) return <Card className="text-red-400">{error}</Card>
  if (!assessment) return <Card className="text-zinc-400">Assessment not found: {assessmentId}</Card>

  if (result) {
    return (
      <Card className="mx-auto max-w-xl space-y-4">
        <Badge>{result.passed ? 'Passed' : 'Keep practicing'}</Badge>
        <h1 className="text-2xl font-semibold">{assessment.title}</h1>
        <p className="text-zinc-500">
          Score {result.correct}/{result.total} (need {assessment.passingScore})
        </p>
        <div className="flex gap-2">
          <Link to="/today"><Button>Today&apos;s Study</Button></Link>
          <Link to="/journey"><Button variant="secondary">Journey</Button></Link>
        </div>
      </Card>
    )
  }

  if (!started) {
    return (
      <Card className="mx-auto max-w-xl space-y-4">
        <Badge>{assessment.kind || 'assessment'}</Badge>
        <h1 className="text-2xl font-semibold">{assessment.title}</h1>
        <p className="text-zinc-500">{assessment.description}</p>
        {assessment.canDo ? <p className="text-sm text-teal-400">Can Do: {assessment.canDo}</p> : null}
        <Button onClick={() => setStarted(true)}>Start</Button>
      </Card>
    )
  }

  const q = assessment.questions[index] as Exercise
  return (
    <Card className="mx-auto max-w-2xl space-y-4">
      <Badge>
        {index + 1} / {assessment.questions.length}
      </Badge>
      <h2 className="text-xl font-semibold">{q.question}</h2>
      <Question
        q={q}
        onNext={(a) => {
          const next = { ...answers, [q.id]: a }
          setAnswers(next)
          if (index + 1 >= assessment.questions.length) setResult(runAssessment(assessment, next))
          else setIndex((i) => i + 1)
        }}
      />
    </Card>
  )
}

function Question({ q, onNext }: { q: Exercise; onNext: (a: unknown) => void }) {
  const [text, setText] = useState('')
  const [match, setMatch] = useState<Record<string, string>>({})
  if (q.type === 'multiple_choice') {
    return (
      <div className="space-y-2">
        {(q.options || []).map((o) => (
          <Button key={o} variant="secondary" className="w-full justify-start" onClick={() => onNext(o)}>
            {o}
          </Button>
        ))}
      </div>
    )
  }
  if (q.type === 'true_false') {
    return (
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onNext(true)}>True</Button>
        <Button variant="secondary" onClick={() => onNext(false)}>False</Button>
      </div>
    )
  }
  if (q.type === 'matching') {
    return (
      <div className="space-y-3">
        {(q.pairs || []).map((p) => (
          <div key={p.left} className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-zinc-800 px-3 py-2 text-sm">{p.left}</div>
            <select
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={match[p.left] || ''}
              onChange={(e) => setMatch({ ...match, [p.left]: e.target.value })}
            >
              <option value="">—</option>
              {(q.pairs || []).map((x) => (
                <option key={x.right + p.left} value={x.right}>{x.right}</option>
              ))}
            </select>
          </div>
        ))}
        <Button onClick={() => onNext(match)}>Next</Button>
      </div>
    )
  }
  return (
    <div className="flex gap-2">
      <input className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} />
      <Button onClick={() => onNext(text)}>Next</Button>
    </div>
  )
}
