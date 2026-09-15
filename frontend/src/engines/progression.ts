import { useAppStore } from '../stores/appStore'
import { getCurriculum } from './curriculum'

export function isLessonUnlocked(lessonId: string) {
  const { unlockedLessons, completedLessons } = useAppStore.getState().progress
  // Completed lessons stay revisitable even if unlock state drifted.
  return unlockedLessons.includes(lessonId) || completedLessons.includes(lessonId)
}

export function isModuleUnlocked(moduleId: string) {
  return useAppStore.getState().progress.unlockedModules.includes(moduleId)
}

export function orderedLessonsForLevel(levelId: string) {
  const cur = getCurriculum()
  if (!cur) return []
  const modules = [...(cur.modulesByLevel[levelId] || [])].sort((a, b) => a.order - b.order)
  const list: Array<{ moduleId: string; lessonId: string; title: string }> = []
  for (const m of modules) {
    for (const l of [...m.lessons].sort((a, b) => a.order - b.order)) {
      list.push({ moduleId: m.id, lessonId: l.id, title: l.title })
    }
  }
  return list
}

export function nextLessonAfter(lessonId: string) {
  const cur = getCurriculum()
  if (!cur) return null
  const lesson = cur.lessons[lessonId]
  if (!lesson) return null
  const levelId = lesson.level.toLowerCase()
  const ordered = orderedLessonsForLevel(levelId)
  const idx = ordered.findIndex((x) => x.lessonId === lessonId)
  if (idx >= 0 && idx < ordered.length - 1) return ordered[idx + 1]
  // jump to next level first lesson
  if (levelId === 'a1') {
    const a2 = orderedLessonsForLevel('a2')
    return a2[0] || null
  }
  return null
}

export function onLessonCheckpointPassed(lessonId: string) {
  const store = useAppStore.getState()
  store.completeLesson(lessonId)
  store.unlockLesson(lessonId) // keep revisitable
  store.markSectionComplete(lessonId, 'checkpoint')
  const lesson = getCurriculum()?.lessons[lessonId]
  if (lesson?.canDo) store.setProgress({ canDo: { ...store.progress.canDo, [lessonId]: true } })

  // Unlock every prior lesson in the level path so the journey stays browsable.
  const levelId = lesson?.level?.toLowerCase() || 'a1'
  const ordered = orderedLessonsForLevel(levelId)
  const idx = ordered.findIndex((x) => x.lessonId === lessonId)
  for (let i = 0; i <= idx; i += 1) {
    store.unlockLesson(ordered[i].lessonId)
    store.unlockModule(ordered[i].moduleId)
  }

  const next = nextLessonAfter(lessonId)
  if (next) {
    store.unlockLesson(next.lessonId)
    store.unlockModule(next.moduleId)
    store.setProgress({
      currentLessonId: next.lessonId,
      currentModuleId: next.moduleId,
      currentLevel: next.moduleId.startsWith('a2') ? 'A2' : 'A1',
    })
  }
}

export function onModuleTestPassed(moduleId: string) {
  const cur = getCurriculum()
  if (!cur) return
  const levelId = moduleId.split('-')[0]
  const modules = [...(cur.modulesByLevel[levelId] || [])].sort((a, b) => a.order - b.order)
  const idx = modules.findIndex((m) => m.id === moduleId)
  const next = modules[idx + 1]
  const store = useAppStore.getState()
  if (next) {
    store.unlockModule(next.id)
    const first = [...next.lessons].sort((a, b) => a.order - b.order)[0]
    if (first) {
      store.unlockLesson(first.id)
      store.setProgress({ currentModuleId: next.id, currentLessonId: first.id })
    }
  }
}

export function onLevelTestPassed(level: 'A1' | 'A2') {
  const store = useAppStore.getState()
  if (level === 'A1') {
    store.unlockModule('a2-m1')
    store.unlockLesson('a2-m1-l1')
    store.setProgress({ currentLevel: 'A2', currentModuleId: 'a2-m1', currentLessonId: 'a2-m1-l1' })
  }
}

export function applyDiagnosticPlacement(level: 'A1' | 'A2', moduleId: string, lessonId: string) {
  const store = useAppStore.getState()
  store.unlockModule(moduleId)
  store.unlockLesson(lessonId)
  // unlock all prior lessons in path for browsing
  const ordered = orderedLessonsForLevel(level.toLowerCase())
  const unlock: string[] = []
  for (const item of ordered) {
    unlock.push(item.lessonId)
    store.unlockModule(item.moduleId)
    if (item.lessonId === lessonId) break
  }
  store.setProgress({
    diagnosticDone: true,
    currentLevel: level,
    currentModuleId: moduleId,
    currentLessonId: lessonId,
    unlockedLessons: [...new Set([...store.progress.unlockedLessons, ...unlock])],
  })
}
