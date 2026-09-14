/** Build a lesson spec with consistent structure and real pedagogical content. */
export function lesson({
  id,
  moduleId,
  order,
  level,
  title,
  topic,
  estimatedMinutes = 40,
  objectives,
  canDo,
  warmUp,
  explanation,
  grammar,
  vocabulary,
  examples,
  reading,
  writing,
  tutorHints,
  exerciseBank,
  preserve = false,
}) {
  return {
    id,
    moduleId,
    order,
    level,
    title,
    topic,
    estimatedMinutes,
    objectives,
    canDo,
    warmUp,
    explanation,
    grammar: { ruleId: grammar.ruleId, ...grammar },
    vocabulary,
    examples,
    reading,
    writing,
    tutorHints,
    exerciseBank,
    preserve,
  };
}

export function module(id, levelId, order, title, description, canDoSummary, lessonSpecs) {
  return {
    id,
    levelId,
    order,
    title,
    description,
    canDoSummary,
    lessons: lessonSpecs.map((l, i) => ({ ...l, moduleId: id, order: i + 1, level: levelId === 'a1' ? 'A1' : 'A2' })),
  };
}

export function vocab(word, translation, partOfSpeech, example, collocations = [], extra = {}) {
  return { word, translation, partOfSpeech, example, collocations, ...extra };
}

export function readQ(id, question, type, answer, explanation, extra = {}) {
  return { id, question, type, answer, explanation, ...extra };
}
