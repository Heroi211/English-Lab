import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../stores/appStore'
import { buildTodayPlan } from '../engines/adaptive'
import { useCurriculum } from '../hooks/useCurriculum'

export function TodayPage() {
  const { loading, error } = useCurriculum()
  const mode = useAppStore((s) => s.settings.studyMode)
  const setSettings = useAppStore((s) => s.setSettings)
  const plan = buildTodayPlan(mode)

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading…</p>
  if (error) return <Card className="text-red-400">{error}</Card>

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">TODAY&apos;S STUDY</p>
        <h1 className="mt-3 text-3xl font-semibold">What should you study now?</h1>
        <p className="mt-2 text-zinc-500">Adaptive plan: reviews → mistakes → new content → practice → checkpoint.</p>
      </header>

      <div className="mb-6 flex gap-2">
        {(['quick', 'standard', 'deep'] as const).map((m) => (
          <Button key={m} variant={mode === m ? 'primary' : 'secondary'} onClick={() => setSettings({ studyMode: m })}>
            {m}
          </Button>
        ))}
      </div>

      <Card className="mb-6">
        <p className="font-mono text-xs text-teal-400">NEXT</p>
        <h2 className="mt-2 text-2xl font-semibold">{plan.nextBest.title}</h2>
        <p className="mt-2 text-zinc-500">{plan.nextBest.reason}</p>
        <Link to={plan.nextBest.route} className="mt-4 inline-flex">
          <Button>Start</Button>
        </Link>
      </Card>

      <div className="space-y-3">
        {plan.steps.map((s, i) => (
          <Card key={s.title + i} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{i + 1}. {s.title}</p>
              <p className="text-sm text-zinc-500">{s.reason}</p>
            </div>
            <Link to={s.route}>
              <Button variant="ghost">Open</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
