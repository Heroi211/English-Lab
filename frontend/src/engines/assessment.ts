import type { Assessment } from '../types'
import { validateAnswer, scoreSession } from './exercise'
import { updateMasteryScore } from './mastery'
import { recordMistake, resolveMistakesForExercise } from './mistakes'
import { scheduleAfterAnswer, upsertReviewItem } from './review'
import { useAppStore } from '../stores/appStore'
import { onLessonCheckpointPassed, onLevelTestPassed, onModuleTestPassed } from './progression'

export function runAssessment(assessment: Assessment, answersById: Record<string, unknown>) {
  const results = (assessment.questions || []).map((q) => validateAnswer(q, answersById[q.id]))
  const score = scoreSession(results)
  const passed = score.correct >= (assessment.passingScore || Math.ceil(score.total * 0.7))
  const store = useAppStore.getState()

  for (const r of results) {
    const current = store.progress.mastery[r.topic] ?? 40
    store.patchMastery(r.topic, updateMasteryScore(current, { correct: r.correct, weight: 1.2 }))
    upsertReviewItem({ itemId: r.exerciseId, kind: 'exercise', topic: r.topic, label: r.exerciseId })
    scheduleAfterAnswer(r.exerciseId, r.correct)
    if (!r.correct) {
      recordMistake({
        exerciseId: r.exerciseId,
        topic: r.topic,
        ruleId: r.ruleId,
        userAnswer: r.userAnswer,
        correctAnswer: r.expected,
        source: 'assessment',
      })
    } else resolveMistakesForExercise(r.exerciseId)
  }

  const result = {
    assessmentId: assessment.id,
    at: new Date().toISOString(),
    ...score,
    passed,
    kind: assessment.kind || 'checkpoint',
  }
  store.setProgress({
    assessmentHistory: [...store.progress.assessmentHistory, result].slice(-80),
  })

  if (passed) {
    if (assessment.kind === 'checkpoint' && assessment.lessonId) onLessonCheckpointPassed(assessment.lessonId)
    if (assessment.kind === 'module' && assessment.moduleId) onModuleTestPassed(assessment.moduleId)
    if (assessment.kind === 'level' && assessment.level === 'A1') onLevelTestPassed('A1')
    if (assessment.kind === 'level' && assessment.level === 'A2') onLevelTestPassed('A2')
  }

  return result
}
