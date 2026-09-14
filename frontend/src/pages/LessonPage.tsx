import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { TextArea } from '../components/ui/TextArea'
import { ExercisePlayer } from '../components/learning/ExercisePlayer'
import { useCurriculum } from '../hooks/useCurriculum'
import { useAppStore } from '../stores/appStore'
import { isLessonUnlocked } from '../engines/progression'
import { upsertReviewItem } from '../engines/review'
import clsx from 'clsx'

const SECTIONS = [
  { id: 'warmup', label: 'Warm-up' },
  { id: 'explanation', label: 'Explanation' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'examples', label: 'Examples' },
  { id: 'practice', label: 'Practice' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'checkpoint', label: 'Checkpoint' },
]

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const [params] = useSearchParams()
  const { data, loading, error } = useCurriculum()
  const completed = useAppStore((s) => s.progress.completedSections)
  const markSectionComplete = useAppStore((s) => s.markSectionComplete)
  const touchStreak = useAppStore((s) => s.touchStreak)
  const setProgress = useAppStore((s) => s.setProgress)

  const lesson = data?.lessons[lessonId]
  const exercises = data?.exercisesByLesson[lessonId] || []
  const initial = params.get('section') || 'warmup'
  const [section, setSection] = useState(initial)

  const unlocked = isLessonUnlocked(lessonId)

  const sectionBody = useMemo(() => {
    if (!lesson) return null
    if (section === 'warmup') {
      return (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{lesson.warmUp.title}</h2>
          <p className="whitespace-pre-wrap text-zinc-300">{lesson.warmUp.prompt}</p>
          <ul className="space-y-1 text-sm text-zinc-500">
            {(lesson.warmUp.reflectionQuestions || []).map((q) => (
              <li key={q}>• {q}</li>
            ))}
          </ul>
        </div>
      )
    }
    if (section === 'explanation') {
      return <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">{lesson.explanation}</p>
    }
    if (section === 'grammar') {
      const g = lesson.grammar
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{g.title}</h2>
          <p className="text-zinc-300">{g.rule}</p>
          {g.table && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    {g.table.headers.map((h) => (
                      <th key={h} className="px-2 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.table.rows.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-900">
                      {row.map((c, j) => (
                        <td key={j} className="px-2 py-2 text-zinc-300">{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="space-y-2">
            {(g.examples || []).map((ex) => (
              <div key={ex.sentence} className="rounded-md border border-zinc-800 px-3 py-2 text-sm">
                <p>{ex.sentence}</p>
                {ex.note ? <p className="text-zinc-500">{ex.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      )
    }
    if (section === 'vocabulary') {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {lesson.vocabulary.map((v) => (
            <div key={v.word} className="rounded-md border border-zinc-800 p-3">
              <p className="font-medium">{v.word}</p>
              <p className="font-mono text-xs text-zinc-500">
                {v.translation} · {v.partOfSpeech}
              </p>
              <p className="mt-2 text-sm text-zinc-300">{v.example}</p>
              <p className="mt-2 font-mono text-[11px] text-teal-500">{(v.collocations || []).join(' · ')}</p>
            </div>
          ))}
        </div>
      )
    }
    if (section === 'examples') {
      return (
        <div className="space-y-3">
          {lesson.examples.map((block, i) => {
            if (typeof block === 'string') return <p key={i}>{block}</p>
            return (
              <div key={i} className="space-y-1">
                {block.title ? <h3 className="font-medium">{block.title}</h3> : null}
                {(block.lines || block.sentences || []).map((line, j) => (
                  <p key={j} className="text-sm text-zinc-300">
                    {typeof line === 'string' ? line : JSON.stringify(line)}
                  </p>
                ))}
              </div>
            )
          })}
        </div>
      )
    }
    if (section === 'practice') {
      return (
        <ExercisePlayer
          exercises={exercises}
          onComplete={() => {
            markSectionComplete(lesson.id, 'practice')
            touchStreak()
            setSection('reading')
          }}
        />
      )
    }
    if (section === 'reading') {
      return <ReadingBlock lessonId={lesson.id} />
    }
    if (section === 'writing') {
      return <WritingBlock lessonId={lesson.id} onDone={() => setSection('checkpoint')} />
    }
    if (section === 'checkpoint') {
      return (
        <div className="space-y-3">
          <p className="text-zinc-400">Validate this lesson before unlocking the next one.</p>
          <Link to={`/assessments/${lesson.checkpointId}`}>
            <Button>Start checkpoint</Button>
          </Link>
        </div>
      )
    }
    return null
  }, [lesson, section, exercises])

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading lesson…</p>
  if (error) return <Card className="text-red-400">{error}</Card>
  if (!lesson) return <Card className="text-red-400">Lesson not found.</Card>
  if (!unlocked) return <Card className="text-zinc-400">This lesson is locked. Finish previous checkpoints first.</Card>

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.7fr)]">
      <div>
        <header className="mb-6">
          <p className="font-mono text-xs text-teal-400">{lesson.level} · {lesson.moduleId}</p>
          <h1 className="mt-3 text-3xl font-semibold">{lesson.title}</h1>
          <p className="mt-2 text-zinc-500">
            <span className="text-teal-400">Can Do:</span> {lesson.canDo}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => {
            const done = completed[`${lesson.id}:${s.id}`]
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSection(s.id)
                  setProgress({ lessonSection: s.id, currentLessonId: lesson.id })
                }}
                className={clsx(
                  'rounded px-3 py-1.5 text-xs transition',
                  section === s.id ? 'bg-zinc-900 text-teal-300' : 'text-zinc-500 hover:text-zinc-200',
                  done && 'text-teal-500',
                )}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        <Card>{sectionBody}</Card>

        {section !== 'practice' && section !== 'checkpoint' && (
          <div className="mt-4">
            <Button
              onClick={() => {
                markSectionComplete(lesson.id, section)
                if (section === 'grammar') {
                  upsertReviewItem({
                    itemId: lesson.grammar.ruleId,
                    kind: 'grammar',
                    topic: lesson.grammar.ruleId,
                    label: lesson.grammar.title,
                  })
                }
                if (section === 'vocabulary') {
                  lesson.vocabulary.forEach((v) =>
                    upsertReviewItem({
                      itemId: `vocab_${v.word}`,
                      kind: 'vocab',
                      topic: 'vocabulary',
                      label: v.word,
                    }),
                  )
                }
                touchStreak()
                const idx = SECTIONS.findIndex((s) => s.id === section)
                if (idx < SECTIONS.length - 1) setSection(SECTIONS[idx + 1].id)
              }}
            >
              Mark done & continue
            </Button>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <Card>
          <p className="font-mono text-xs text-zinc-600">OBJECTIVES</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {lesson.objectives.map((o) => (
              <li key={o}>• {o}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="font-mono text-xs text-zinc-600">NEED HELP?</p>
          <p className="mt-2 text-sm text-zinc-500">Ask the tutor with this lesson in context.</p>
          <Link to="/tutor" className="mt-3 inline-block text-sm text-teal-400">
            Open AI Tutor →
          </Link>
        </Card>
        <Badge>{exercises.length} practice items</Badge>
      </aside>
    </div>
  )
}

function ReadingBlock({ lessonId }: { lessonId: string }) {
  const { data } = useCurriculum()
  const lesson = data?.lessons[lessonId]
  const markSectionComplete = useAppStore((s) => s.markSectionComplete)
  const touchStreak = useAppStore((s) => s.touchStreak)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [fb, setFb] = useState<string | null>(null)
  if (!lesson) return null
  const qs = lesson.reading.questions
  if (i >= qs.length) {
    return (
      <div className="space-y-3">
        <p className="text-lg font-semibold">Reading complete · {score}/{qs.length}</p>
        <Button
          onClick={() => {
            markSectionComplete(lessonId, 'reading')
            touchStreak()
          }}
        >
          Continue
        </Button>
      </div>
    )
  }
  const q = qs[i]
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{lesson.reading.title}</h2>
      <p className="whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-300">
        {lesson.reading.text}
      </p>
      <Badge>
        Q{i + 1}/{qs.length}
      </Badge>
      <p className="font-medium">{q.question}</p>
      {q.type === 'multiple_choice' ? (
        <div className="space-y-2">
          {(q.options || []).map((o) => (
            <Button
              key={o}
              variant="secondary"
              className="w-full justify-start"
              onClick={() => {
                const ok = o === q.answer
                if (ok) setScore((s) => s + 1)
                setFb(ok ? 'Correct' : q.explanation || 'Check again')
                setTimeout(() => {
                  setFb(null)
                  setI((x) => x + 1)
                }, 700)
              }}
            >
              {o}
            </Button>
          ))}
        </div>
      ) : q.type === 'true_false' ? (
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <Button
              key={String(v)}
              variant="secondary"
              onClick={() => {
                const ok = v === q.answer
                if (ok) setScore((s) => s + 1)
                setFb(ok ? 'Correct' : q.explanation || 'Not quite')
                setTimeout(() => {
                  setFb(null)
                  setI((x) => x + 1)
                }, 700)
              }}
            >
              {v ? 'True' : 'False'}
            </Button>
          ))}
        </div>
      ) : (
        <ReadingShort
          onDone={(ans) => {
            const accepted = (q.acceptableAnswers || [String(q.answer)]).map((a) => a.toLowerCase())
            const ok = accepted.some((a) => ans.toLowerCase().includes(a) || a.includes(ans.toLowerCase()))
            if (ok) setScore((s) => s + 1)
            setFb(ok ? 'Correct' : q.explanation || 'Not quite')
            setTimeout(() => {
              setFb(null)
              setI((x) => x + 1)
            }, 700)
          }}
        />
      )}
      {fb && <p className="text-sm text-teal-400">{fb}</p>}
    </div>
  )
}

function ReadingShort({ onDone }: { onDone: (a: string) => void }) {
  const [v, setV] = useState('')
  return (
    <div className="flex gap-2">
      <input
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <Button onClick={() => onDone(v)}>Check</Button>
    </div>
  )
}

function WritingBlock({ lessonId, onDone }: { lessonId: string; onDone: () => void }) {
  const { data } = useCurriculum()
  const lesson = data?.lessons[lessonId]
  const markSectionComplete = useAppStore((s) => s.markSectionComplete)
  const touchStreak = useAppStore((s) => s.touchStreak)
  const [text, setText] = useState('')
  const [tips, setTips] = useState<string[]>([])
  if (!lesson) return null
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <div className="space-y-4">
      <p>{lesson.writing.prompt}</p>
      <ul className="space-y-1 text-sm text-zinc-500">
        {lesson.writing.rubricHints.map((h) => (
          <li key={h}>• {h}</li>
        ))}
      </ul>
      <TextArea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write here…" />
      <p className="font-mono text-xs text-zinc-600">
        {words} words · min {lesson.writing.minWords}
      </p>
      <Button
        onClick={() => {
          const t: string[] = []
          if (words < lesson.writing.minWords) t.push(`Aim for ${lesson.writing.minWords}+ words.`)
          const be = (text.match(/\b(am|is|are|was|were|will|'m|'s|'re)\b/gi) || []).length
          if (be < 3) t.push('Use target grammar forms more often.')
          setTips(t)
          markSectionComplete(lessonId, 'writing')
          touchStreak()
          if (!t.length) onDone()
        }}
      >
        Check & save
      </Button>
      {tips.map((t) => (
        <p key={t} className="text-sm text-zinc-400">
          • {t}
        </p>
      ))}
      {lesson.writing.modelAnswer ? (
        <details className="text-sm text-zinc-500">
          <summary>Model answer</summary>
          <p className="mt-2 whitespace-pre-wrap">{lesson.writing.modelAnswer}</p>
        </details>
      ) : null}
    </div>
  )
}
