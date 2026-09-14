import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { TextArea } from '../components/ui/TextArea'
import { useAppStore } from '../stores/appStore'
import { useCurriculum } from '../hooks/useCurriculum'
import { openMistakes, recordMistake } from '../engines/mistakes'
import { upsertReviewItem } from '../engines/review'
import clsx from 'clsx'

const MODES = ['explain', 'correct', 'practice', 'chat'] as const

export function TutorPage() {
  const { data } = useCurriculum()
  const progress = useAppStore((s) => s.progress)
  const settings = useAppStore((s) => s.settings)
  const lesson = data?.lessons[progress.currentLessonId]
  const [mode, setMode] = useState<(typeof MODES)[number]>('explain')
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'tutor'; text: string }>>([
    {
      role: 'tutor',
      text: `Hi! I'm your English Journey tutor. You're on ${lesson?.title || 'your current lesson'}. Ask me to explain, correct, or practice.`,
    },
  ])

  async function send(text: string) {
    const message = text.trim()
    if (!message) return
    setMessages((m) => [...m, { role: 'user', text: message }])
    setInput('')
    setStatus('Thinking…')
    const payload = {
      message,
      mode,
      context: {
        level: progress.currentLevel,
        lessonId: progress.currentLessonId,
        lessonTitle: lesson?.title,
        canDo: lesson?.canDo,
        section: progress.lessonSection,
        recentMistakes: openMistakes(5).map((m) => ({
          topic: m.topic,
          userAnswer: m.userAnswer,
          correctAnswer: m.correctAnswer,
        })),
        tutorHints: lesson?.tutorHints || [],
        grammarRuleId: lesson?.grammar.ruleId,
      },
    }
    const base = (settings.backendUrl || '').replace(/\/$/, '')
    try {
      const res = await fetch(`${base}/api/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const reply = json.reply || 'No reply.'
      setMessages((m) => [...m, { role: 'tutor', text: reply }])
      setStatus(json.offline ? `Offline fallback` : `Provider: ${json.provider || 'ok'}`)

      // Tutor → learning signals
      if (mode === 'correct' || /correct|error|should be|instead of/i.test(reply)) {
        recordMistake({
          exerciseId: `tutor_${Date.now()}`,
          topic: lesson?.grammar.ruleId || 'tutor',
          ruleId: lesson?.grammar.ruleId,
          userAnswer: message,
          correctAnswer: 'See tutor feedback',
          source: 'tutor',
        })
        upsertReviewItem({
          itemId: `tutor_${progress.currentLessonId}`,
          kind: 'tutor',
          topic: lesson?.grammar.ruleId || 'tutor',
          label: 'Tutor correction',
        })
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'tutor',
          text: `(Local tip) Keep using am/is/are with the right subject. Backend unreachable: ${String((e as Error).message)}`,
        },
      ])
      setStatus('Offline fallback')
    }
  }

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">AI TUTOR</p>
        <h1 className="mt-3 text-3xl font-semibold">Contextual help</h1>
        <p className="mt-2 text-zinc-500">
          Context: {progress.currentLevel} · {lesson?.title || progress.currentLessonId}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Button key={m} variant={mode === m ? 'primary' : 'ghost'} onClick={() => setMode(m)}>
                {m}
              </Button>
            ))}
          </div>
          <div className="mb-4 max-h-[420px] space-y-3 overflow-auto rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={clsx(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                  m.role === 'user' ? 'ml-auto bg-teal-950/40 text-teal-100' : 'bg-zinc-900 text-zinc-300',
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask something…" onKeyDown={(e) => e.key === 'Enter' && send(input)} />
            <Button onClick={() => send(input)}>Send</Button>
          </div>
          <p className="mt-2 font-mono text-xs text-zinc-600">{status || `Backend: ${settings.backendUrl || '/api (same-origin)'}`}</p>
        </Card>
        <Card className="space-y-2">
          <p className="font-mono text-xs text-zinc-600">QUICK PROMPTS</p>
          {[
            'Explain the grammar of this lesson with examples.',
            'Correct: She are my teacher.',
            'Give me 3 practice questions about this lesson.',
            'How do I say my age in English?',
          ].map((p) => (
            <Button key={p} variant="secondary" className="w-full justify-start text-left" onClick={() => send(p)}>
              {p}
            </Button>
          ))}
          <TextArea className="mt-3" rows={4} readOnly value={(lesson?.tutorHints || []).join('\n')} />
        </Card>
      </div>
    </div>
  )
}
