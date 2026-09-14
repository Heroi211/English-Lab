export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'true_false'
  | 'matching'
  | 'ordering'
  | 'error_correction'

export interface Exercise {
  id: string
  type: ExerciseType
  level: string
  topic: string
  question: string
  options?: string[]
  answer?: string | boolean
  answers?: string[]
  pairs?: { left: string; right: string }[]
  items?: string[]
  correctOrder?: string[]
  explanation: string
  ruleId?: string | null
}

export interface VocabItem {
  id?: string
  word: string
  translation: string
  partOfSpeech: string
  example: string
  collocations?: string[]
  relatedWords?: string[]
  level?: string
  topic?: string
}

export interface Lesson {
  id: string
  moduleId: string
  level: string
  order: number
  title: string
  estimatedMinutes?: number
  objectives: string[]
  canDo: string
  warmUp: { title: string; prompt: string; reflectionQuestions?: string[] }
  explanation: string
  grammar: {
    ruleId: string
    title: string
    rule: string
    table?: { headers: string[]; rows: string[][] }
    examples?: { sentence: string; note?: string }[]
  }
  vocabulary: VocabItem[]
  examples: Array<string | { title?: string; lines?: string[]; sentences?: string[] }>
  practice: string[]
  reading: {
    title: string
    text: string
    questions: Array<{
      id: string
      question: string
      type: string
      answer: string | boolean
      options?: string[]
      acceptableAnswers?: string[]
      explanation?: string
    }>
  }
  writing: {
    prompt: string
    minWords: number
    rubricHints: string[]
    modelAnswer?: string
  }
  review: Array<{ kind: string; ref: string }>
  checkpointId: string
  tutorHints?: string[]
}

export interface ModuleMeta {
  id: string
  levelId: string
  order: number
  title: string
  description: string
  lessons: Array<{ id: string; order: number; title: string }>
  assessmentId?: string
  canDoSummary?: string
}

export interface LevelMeta {
  id: string
  cefr: string
  title: string
  description: string
  order: number
  status?: 'available' | 'coming_soon'
}

export interface Mistake {
  id: string
  exerciseId: string
  topic: string
  ruleId?: string | null
  userAnswer: unknown
  correctAnswer: unknown
  source: string
  at: string
  resolved: boolean
}

export interface ReviewItem {
  itemId: string
  kind: string
  topic: string
  label: string
  dueAt: string
  intervalIndex: number
  streakCorrect: number
}

export interface Assessment {
  id: string
  lessonId?: string
  moduleId?: string
  level?: string
  title: string
  description: string
  passingScore: number
  totalQuestions?: number
  canDo?: string
  kind?: 'checkpoint' | 'module' | 'level' | 'diagnostic'
  questions: Exercise[]
}

export interface DiagnosticResult {
  takenAt: string
  estimatedLevel: 'A1' | 'A2'
  moduleId: string
  lessonId: string
  score: number
  total: number
}
