import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useCurriculum } from '../hooks/useCurriculum'
import { useAppStore } from '../stores/appStore'
import { isLessonUnlocked, isModuleUnlocked } from '../engines/progression'
import clsx from 'clsx'

export function JourneyPage() {
  const { data, loading, error } = useCurriculum()
  const completed = useAppStore((s) => s.progress.completedLessons)
  const current = useAppStore((s) => s.progress.currentLessonId)

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading journey…</p>
  if (error) return <Card className="text-red-400">{error}</Card>
  if (!data) return null

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">JOURNEY</p>
        <h1 className="mt-3 text-3xl font-semibold">A1 → A2 roadmap</h1>
        <p className="mt-2 text-zinc-500">Deep curriculum for Foundation and Consolidation. Completed lessons stay open — revisit writing, practice, and mistakes anytime.</p>
      </header>

      <div className="relative space-y-8 md:ml-12 md:border-l md:border-zinc-800 md:pl-8">
        {data.levels.map((level) => {
          const modules = data.modulesByLevel[level.id] || []
          const coming = level.status === 'coming_soon'
          return (
            <div key={level.id} className="relative">
              <div className="absolute -left-12 top-0 hidden h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-lab-950 font-mono text-xs text-teal-400 md:flex">
                {level.cefr}
              </div>
              <Card className={clsx(coming && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge>{level.cefr}</Badge>
                    <h2 className="mt-3 text-xl font-semibold">{level.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{level.description}</p>
                  </div>
                  {coming ? <Badge className="border-zinc-700 text-zinc-500">Em breve</Badge> : null}
                </div>
                {!coming && (
                  <div className="mt-6 space-y-4">
                    {modules.map((mod) => (
                      <div key={mod.id} className="rounded-md border border-zinc-800 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{mod.title}</h3>
                          <span className="font-mono text-xs text-zinc-600">
                            {isModuleUnlocked(mod.id) ? 'unlocked' : 'locked'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">{mod.description}</p>
                        <div className="mt-3 space-y-2">
                          {mod.lessons.map((l) => {
                            const unlocked = isLessonUnlocked(l.id)
                            const done = completed.includes(l.id)
                            return (
                              <div key={l.id} className="flex items-center justify-between gap-2 text-sm">
                                <span className={clsx(!unlocked && 'text-zinc-600')}>
                                  {done ? '✓ ' : current === l.id ? '→ ' : ''}
                                  {l.title}
                                </span>
                                {unlocked ? (
                                  <Link to={`/learn/${l.id}`} className="text-teal-400 hover:text-teal-300">
                                    {done ? 'Revisit' : 'Open'}
                                  </Link>
                                ) : (
                                  <span className="font-mono text-xs text-zinc-700">locked</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {mod.assessmentId && isModuleUnlocked(mod.id) ? (
                          <Link to={`/assessments/${mod.assessmentId}`} className="mt-3 inline-block text-sm text-teal-400">
                            Module test →
                          </Link>
                        ) : null}
                      </div>
                    ))}
                    {(level.cefr === 'A1' || level.cefr === 'A2') && (
                      <Link to={`/assessments/${level.cefr.toLowerCase()}-level-test`} className="inline-block text-sm text-teal-400">
                        {level.cefr} level test →
                      </Link>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
