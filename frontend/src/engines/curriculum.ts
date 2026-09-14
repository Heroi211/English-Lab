import type { Assessment, Exercise, Lesson, LevelMeta, ModuleMeta, VocabItem } from '../types'

export interface CurriculumIndex {
  levels: LevelMeta[]
  modulesByLevel: Record<string, ModuleMeta[]>
  lessons: Record<string, Lesson>
  exercisesByLesson: Record<string, Exercise[]>
  assessments: Record<string, Assessment>
  vocabularyByLesson: Record<string, VocabItem[]>
  grammar: Record<string, unknown>
}

let cache: CurriculumIndex | null = null

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.json() as Promise<T>
}

export async function loadCurriculum(): Promise<CurriculumIndex> {
  if (cache) return cache

  const index = await fetchJson<{
    levels: LevelMeta[]
    modules: Record<string, string>
  }>('/data/curriculum/index.json')

  const modulesByLevel: Record<string, ModuleMeta[]> = {}
  const lessons: Record<string, Lesson> = {}
  const exercisesByLesson: Record<string, Exercise[]> = {}
  const assessments: Record<string, Assessment> = {}
  const vocabularyByLesson: Record<string, VocabItem[]> = {}
  const grammar: Record<string, unknown> = {}

  for (const [levelId, modulesPath] of Object.entries(index.modules)) {
    const pack = await fetchJson<{ modules: ModuleMeta[] }>(modulesPath)
    modulesByLevel[levelId] = pack.modules

    for (const mod of pack.modules) {
      for (const meta of mod.lessons) {
        const lesson = await fetchJson<Lesson>(`/data/curriculum/${levelId}/lessons/${meta.id}.json`)
        lessons[lesson.id] = lesson
        try {
          const ex = await fetchJson<{ exercises: Exercise[] }>(`/data/exercises/${meta.id}.json`)
          exercisesByLesson[meta.id] = ex.exercises
        } catch {
          exercisesByLesson[meta.id] = []
        }
        try {
          const vocab = await fetchJson<{ items: VocabItem[] }>(`/data/vocabulary/${meta.id}.json`)
          vocabularyByLesson[meta.id] = vocab.items
        } catch {
          vocabularyByLesson[meta.id] = lesson.vocabulary || []
        }
        if (lesson.checkpointId) {
          try {
            const cp = await fetchJson<Assessment>(`/data/assessments/${lesson.checkpointId}.json`)
            assessments[cp.id] = cp
          } catch {
            /* optional during generation */
          }
        }
        if (lesson.grammar?.ruleId) {
          try {
            grammar[lesson.grammar.ruleId] = await fetchJson(`/data/grammar/${lesson.grammar.ruleId}.json`)
          } catch {
            /* optional */
          }
        }
      }
      if (mod.assessmentId) {
        try {
          const a = await fetchJson<Assessment>(`/data/assessments/${mod.assessmentId}.json`)
          assessments[a.id] = a
        } catch {
          /* optional */
        }
      }
    }
  }

  for (const level of index.levels) {
    if (level.cefr === 'A1' || level.cefr === 'A2') {
      try {
        const lt = await fetchJson<Assessment>(`/data/assessments/${level.cefr.toLowerCase()}-level-test.json`)
        assessments[lt.id] = lt
      } catch {
        /* optional */
      }
    }
  }

  try {
    const diag = await fetchJson<Assessment>('/data/assessments/diagnostic.json')
    assessments[diag.id] = diag
  } catch {
    /* optional */
  }

  cache = {
    levels: index.levels,
    modulesByLevel,
    lessons,
    exercisesByLesson,
    assessments,
    vocabularyByLesson,
    grammar,
  }
  return cache
}

export function getCurriculum() {
  return cache
}

export function clearCurriculumCache() {
  cache = null
}
