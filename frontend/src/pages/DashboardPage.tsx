import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../stores/appStore'
import { buildTodayPlan, weakTopics } from '../engines/adaptive'
import { averageMastery, bandFor } from '../engines/mastery'
import { overdueCount } from '../engines/review'
import { openMistakes } from '../engines/mistakes'
import { useCurriculum } from '../hooks/useCurriculum'

export function DashboardPage() {
  const { loading, error } = useCurriculum()
  const progress = useAppStore((s) => s.progress)
  const mode = useAppStore((s) => s.settings.studyMode)
  const plan = buildTodayPlan(mode)
  const avg = averageMastery(progress.mastery)
  const weak = weakTopics(4)

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading curriculum…</p>
  if (error) return <Card className="text-red-400">{error}</Card>

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">DASHBOARD</p>
        <h1 className="mt-3 text-3xl font-semibold">Your English path</h1>
        <p className="mt-2 text-zinc-500">Level {progress.currentLevel} · open the next best activity and keep the streak alive.</p>
      </header>

      {!progress.diagnosticDone && (
        <Card className="mb-6 border-teal-900/50">
          <p className="font-mono text-xs text-teal-400">PLACEMENT</p>
          <h2 className="mt-2 text-xl font-semibold">Start with a short diagnostic</h2>
          <p className="mt-2 text-sm text-zinc-500">We’ll place you in the right A1/A2 module.</p>
          <Link to="/diagnostic" className="mt-4 inline-flex">
            <Button>Take diagnostic</Button>
          </Link>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <Card>
          <Badge>Next best activity</Badge>
          <h2 className="mt-4 text-2xl font-semibold">{plan.nextBest.title}</h2>
          <p className="mt-2 text-zinc-500">{plan.nextBest.reason}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={plan.nextBest.route}>
              <Button>Start now</Button>
            </Link>
            <Link to="/today">
              <Button variant="secondary">Today&apos;s plan</Button>
            </Link>
            <Link to="/tutor">
              <Button variant="ghost">Ask tutor</Button>
            </Link>
          </div>
          <div className="mt-8 space-y-3">
            {plan.steps.slice(0, 4).map((s, i) => (
              <Link key={s.title + i} to={s.route} className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-3 text-sm hover:border-zinc-700">
                <span>
                  <span className="font-mono text-xs text-zinc-600">{i + 1}. </span>
                  {s.title}
                </span>
                <ArrowRight size={14} className="text-teal-400" />
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="font-mono text-xs text-zinc-600">MASTERY</p>
            <p className="mt-3 text-4xl font-semibold text-teal-300">{avg}%</p>
            <p className="mt-1 text-sm text-zinc-500">{bandFor(avg).label}</p>
            <div className="mt-4">
              <ProgressBar value={avg} label="Overall" />
            </div>
          </Card>
          <Card className="space-y-3">
            <p className="font-mono text-xs text-zinc-600">SIGNALS</p>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Streak</span><span className="font-mono">{progress.streak}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Reviews due</span><span className="font-mono">{overdueCount()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Open mistakes</span><span className="font-mono">{openMistakes().length}</span></div>
          </Card>
          <Card>
            <p className="font-mono text-xs text-zinc-600">WEAK TOPICS</p>
            <div className="mt-3 space-y-2">
              {weak.length ? weak.map((w) => (
                <div key={w.topic} className="flex justify-between font-mono text-xs">
                  <span className="text-teal-400">+ {w.topic}</span>
                  <span className="text-zinc-600">{w.score}</span>
                </div>
              )) : <p className="text-sm text-zinc-600">Practice to reveal weak topics.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
