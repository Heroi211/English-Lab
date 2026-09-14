import { useAppStore } from '../stores/appStore'
import { getCurriculum } from './curriculum'
import { averageMastery } from './mastery'
import { openMistakes } from './mistakes'
import { dueReviews } from './review'

const MODE_LIMITS = {
  quick: { reviews: 3, mistakes: 2, practice: 4 },
  standard: { reviews: 5, mistakes: 4, practice: 8 },
  deep: { reviews: 8, mistakes: 6, practice: 12 },
}

export function buildTodayPlan(mode: 'quick' | 'standard' | 'deep' = 'standard') {
  const limits = MODE_LIMITS[mode]
  const { progress } = useAppStore.getState()
  const cur = getCurriculum()
  const lessonId = progress.currentLessonId
  const lesson = cur?.lessons[lessonId]
  const reviews = dueReviews().slice(0, limits.reviews)
  const mistakes = openMistakes(limits.mistakes)
  const exercises = (cur?.exercisesByLesson[lessonId] || []).slice(0, limits.practice)
  const sections = progress.completedSections || {}
  const needsLesson = !sections[`${lessonId}:practice`]
  const needsCheckpoint = sections[`${lessonId}:practice`] && !sections[`${lessonId}:checkpoint`]

  const steps: Array<{ type: string; title: string; reason: string; route: string; count: number }> = []

  if (!progress.diagnosticDone) {
    steps.push({
      type: 'diagnostic',
      title: 'Take the placement diagnostic',
      reason: 'Find the best starting module for you',
      route: '/diagnostic',
      count: 1,
    })
  }

  if (reviews.length) {
    steps.push({
      type: 'review',
      title: 'Spaced reviews due',
      reason: `${reviews.length} item(s) ready for review`,
      route: '/review',
      count: reviews.length,
    })
  }

  if (mistakes.length) {
    steps.push({
      type: 'mistakes',
      title: 'Practice your mistakes',
      reason: `${mistakes.length} open error(s)`,
      route: '/review',
      count: mistakes.length,
    })
  }

  if (needsLesson && lesson) {
    steps.push({
      type: 'lesson',
      title: `Study: ${lesson.title}`,
      reason: 'Next content on your path',
      route: `/learn/${lesson.id}`,
      count: 1,
    })
  }

  if (exercises.length) {
    steps.push({
      type: 'practice',
      title: 'Guided practice',
      reason: 'Consolidate today’s grammar and vocabulary',
      route: `/learn/${lessonId}?section=practice`,
      count: Math.min(limits.practice, exercises.length),
    })
  }

  if (needsCheckpoint) {
    steps.push({
      type: 'checkpoint',
      title: 'Lesson checkpoint',
      reason: 'Validate mastery before unlocking the next lesson',
      route: `/assessments/${lesson?.checkpointId || ''}`,
      count: 1,
    })
  }

  if (!steps.length) {
    steps.push({
      type: 'journey',
      title: 'Continue your journey',
      reason: 'Pick the next module on the map',
      route: '/journey',
      count: 1,
    })
  }

  return {
    mode,
    level: progress.currentLevel,
    masteryAvg: averageMastery(progress.mastery),
    nextBest: steps[0],
    steps,
  }
}

export function weakTopics(limit = 5) {
  const mastery = useAppStore.getState().progress.mastery
  return Object.entries(mastery)
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
}
