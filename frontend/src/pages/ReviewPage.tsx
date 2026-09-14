import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ExercisePlayer } from '../components/learning/ExercisePlayer'
import { dueReviews, overdueCount, scheduleAfterAnswer } from '../engines/review'
import { openMistakes } from '../engines/mistakes'
import { useCurriculum } from '../hooks/useCurriculum'
import { useAppStore } from '../stores/appStore'
import { updateMasteryScore } from '../engines/mastery'

export function ReviewPage() {
  const { data } = useCurriculum()
  const due = dueReviews()
  const mistakes = openMistakes(20)
  const [player, setPlayer] = useState(false)
  const patchMastery = useAppStore((s) => s.patchMastery)
  const mastery = useAppStore((s) => s.progress.mastery)

  const mistakeExercises = mistakes
    .map((m) => {
      for (const list of Object.values(data?.exercisesByLesson || {})) {
        const found = list.find((e) => e.id === m.exerciseId)
        if (found) return found
      }
      return null
    })
    .filter(Boolean)

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">REVIEW</p>
        <h1 className="mt-3 text-3xl font-semibold">Retention & mistakes</h1>
        <p className="mt-2 text-zinc-500">Spaced repetition queue and Practice My Mistakes.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Due reviews</h2>
            <Badge>{overdueCount()}</Badge>
          </div>
          <div className="space-y-3">
            {due.length ? (
              due.map((d) => (
                <div key={d.itemId} className="flex items-center justify-between gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm">
                  <div>
                    <p>{d.label}</p>
                    <p className="font-mono text-xs text-zinc-600">
                      {d.kind} · due {d.dueAt}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        scheduleAfterAnswer(d.itemId, true)
                        patchMastery(d.topic, updateMasteryScore(mastery[d.topic], { correct: true, weight: 0.8 }))
                      }}
                    >
                      Got it
                    </Button>
                    <Button variant="ghost" onClick={() => scheduleAfterAnswer(d.itemId, false)}>
                      Again
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">Nothing due. Nice timing.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Practice My Mistakes</h2>
          <p className="mt-2 text-sm text-zinc-500">{mistakes.length} open errors</p>
          <Button className="mt-4" onClick={() => setPlayer(true)} disabled={!mistakeExercises.length}>
            Start session
          </Button>
          <div className="mt-4 flex flex-wrap gap-2">
            {mistakes.slice(0, 8).map((m) => (
              <Badge key={m.id}>{m.topic}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {player && (
        <Card className="mt-6">
          <ExercisePlayer exercises={mistakeExercises as NonNullable<(typeof mistakeExercises)[number]>[]} onComplete={() => setPlayer(false)} />
        </Card>
      )}
    </div>
  )
}
