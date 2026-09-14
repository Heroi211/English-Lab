import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { useCurriculum } from '../hooks/useCurriculum'
import { useAppStore } from '../stores/appStore'
import { isLessonUnlocked } from '../engines/progression'

export function LearnPage() {
  const { data, loading, error } = useCurriculum()
  const current = useAppStore((s) => s.progress.currentLessonId)
  const level = useAppStore((s) => s.progress.currentLevel)

  if (loading) return <p className="animate-pulse font-mono text-sm text-zinc-600">Loading…</p>
  if (error) return <Card className="text-red-400">{error}</Card>
  if (!data) return null

  const modules = data.modulesByLevel[level.toLowerCase()] || []

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">LEARN</p>
        <h1 className="mt-3 text-3xl font-semibold">Curriculum · {level}</h1>
        <p className="mt-2 text-zinc-500">Continue from your current lesson or browse unlocked modules.</p>
      </header>

      <Card className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-teal-400">CURRENT</p>
          <p className="mt-1 font-medium">{data.lessons[current]?.title || current}</p>
        </div>
        <Link to={`/learn/${current}`} className="text-sm text-teal-400">
          Continue →
        </Link>
      </Card>

      <div className="space-y-4">
        {modules.map((m) => (
          <Card key={m.id}>
            <h2 className="text-lg font-semibold">{m.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{m.description}</p>
            <ul className="mt-4 space-y-2">
              {m.lessons.map((l) => (
                <li key={l.id} className="flex justify-between text-sm">
                  <span className={!isLessonUnlocked(l.id) ? 'text-zinc-600' : ''}>{l.title}</span>
                  {isLessonUnlocked(l.id) ? (
                    <Link to={`/learn/${l.id}`} className="text-teal-400">
                      Open
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-zinc-700">locked</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
