import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores/appStore'
import { averageMastery, bandFor, BANDS } from '../engines/mastery'
import { overdueCount } from '../engines/review'
import { openMistakes, mistakesByTopic } from '../engines/mistakes'

export function ProgressPage() {
  const progress = useAppStore((s) => s.progress)
  const avg = averageMastery(progress.mastery)
  const byTopic = mistakesByTopic()

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">PROGRESS</p>
        <h1 className="mt-3 text-3xl font-semibold">Mastery & Can Do</h1>
        <p className="mt-2 text-zinc-500">Track what you own — and what still needs work.</p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="font-mono text-xs text-zinc-600">LEVEL</p>
          <p className="mt-2 text-3xl font-semibold text-teal-300">{progress.currentLevel}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs text-zinc-600">STREAK</p>
          <p className="mt-2 text-3xl font-semibold">{progress.streak}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs text-zinc-600">MASTERY</p>
          <p className="mt-2 text-3xl font-semibold text-teal-300">{avg}</p>
          <p className="text-sm text-zinc-500">{bandFor(avg).label}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-semibold">Topics</h2>
          {Object.entries(progress.mastery).length ? (
            Object.entries(progress.mastery).map(([topic, score]) => (
              <div key={topic}>
                <ProgressBar value={score} label={`${topic} · ${bandFor(score).label}`} />
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-600">No mastery data yet.</p>
          )}
          <p className="font-mono text-[11px] text-zinc-600">{BANDS.map((b) => `${b.label} ${b.min}-${b.max}`).join(' · ')}</p>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-semibold">Signals</h2>
          <div className="flex justify-between text-sm"><span className="text-zinc-500">Reviews due</span><span>{overdueCount()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500">Open mistakes</span><span>{openMistakes().length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500">Lessons completed</span><span>{progress.completedLessons.length}</span></div>
          <div className="pt-2">
            <p className="font-mono text-xs text-zinc-600">MISTAKES BY TOPIC</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(byTopic).map(([t, n]) => (
                <Badge key={t}>
                  {t} · {n}
                </Badge>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <p className="font-mono text-xs text-zinc-600">CAN DO</p>
            <div className="mt-2 space-y-2">
              {Object.entries(progress.canDo).length ? (
                Object.entries(progress.canDo).map(([id, ok]) => (
                  <div key={id} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{id}</span>
                    <span className={ok ? 'text-teal-400' : 'text-zinc-600'}>{ok ? 'Achieved' : 'In progress'}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-600">Pass checkpoints to unlock Can Dos.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
