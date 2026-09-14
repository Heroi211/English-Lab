import fs from 'fs';
import path from 'path';

export const DATA_ROOT = path.resolve(
  'frontend/public/data'
);

export function writeJson(relPath, data) {
  const full = path.join(DATA_ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function readJsonIfExists(relPath) {
  const full = path.join(DATA_ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

export function exId(lessonId, n) {
  const p = lessonId.replace(/-/g, '_');
  return `ex_${p}_${String(n).padStart(2, '0')}`;
}

export function cpId(lessonId, n) {
  const p = lessonId.replace(/-/g, '_');
  return `cp_${p}_${String(n).padStart(2, '0')}`;
}

export function vocabId(word) {
  return `vocab_${word.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
}

function slugTopic(topic) {
  return topic.replace(/\s+/g, '_').toLowerCase();
}

export function buildVocabularyFile(lesson) {
  const topic = slugTopic(lesson.topic || lesson.title);
  return {
    lessonId: lesson.id,
    level: lesson.level,
    topic,
    items: lesson.vocabulary.map((v, i) => ({
      id: vocabId(v.word),
      word: v.word,
      translation: v.translation,
      partOfSpeech: v.partOfSpeech,
      level: lesson.level,
      topic,
      example: v.example,
      collocations: v.collocations || [],
      relatedWords: v.relatedWords || [],
      difficulty: v.difficulty ?? (i < 4 ? 1 : 2),
    })),
  };
}

export function buildGrammarFile(ruleId, lesson, level) {
  const g = lesson.grammar;
  return {
    id: ruleId,
    level,
    title: g.title,
    topic: slugTopic(lesson.topic || g.title),
    summary: g.summary || g.rule.slice(0, 120),
    rule: g.rule,
    forms: g.forms || undefined,
    table: g.table || undefined,
    examples: g.examples?.map((e) => (typeof e === 'string' ? e : e.sentence)) || [],
    commonMistakes: g.commonMistakes || [],
    relatedLessons: [lesson.id],
    tutorHints: g.tutorHints || lesson.tutorHints?.slice(0, 3) || [],
  };
}

function pickTypes(lessonNum) {
  const extra = lessonNum % 2 === 0 ? 'ordering' : 'error_correction';
  return ['multiple_choice', 'fill_blank', 'true_false', 'matching', extra];
}

export function buildExercises(lesson) {
  const { id, level, grammar, vocabulary, topic } = lesson;
  const ruleId = grammar.ruleId;
  const topicSlug = slugTopic(topic || lesson.title);
  const lessonNum = parseInt(id.split('-l').pop(), 10);
  const types = pickTypes(lessonNum);
  const exercises = [];
  let n = 1;

  const add = (ex) => {
    exercises.push({ id: exId(id, n++), level, topic: topicSlug, ruleId: ex.ruleId ?? ruleId, ...ex });
  };

  // MC 1–3 from grammar examples
  const mcQs = lesson.exerciseBank?.multipleChoice || generateDefaultMC(lesson);
  mcQs.slice(0, 3).forEach((q) => add({ type: 'multiple_choice', ...q }));

  // Fill blank 4–6
  const fills = lesson.exerciseBank?.fillBlank || generateDefaultFill(lesson);
  fills.slice(0, 3).forEach((q) => add({ type: 'fill_blank', ...q }));

  // T/F 7–8
  const tfs = lesson.exerciseBank?.trueFalse || generateDefaultTF(lesson);
  tfs.slice(0, 2).forEach((q) => add({ type: 'true_false', ...q }));

  // Matching 9–10
  const matches = lesson.exerciseBank?.matching || generateDefaultMatching(lesson);
  matches.slice(0, 2).forEach((q) => add({ type: 'matching', ...q }));

  // Ordering or error correction 11
  if (types[4] === 'ordering') {
    const ord = lesson.exerciseBank?.ordering || generateDefaultOrdering(lesson);
    add({ type: 'ordering', ...ord });
  } else {
    const ec = lesson.exerciseBank?.errorCorrection || generateDefaultErrorCorrection(lesson);
    add({ type: 'error_correction', ...ec });
  }

  // MC 12
  const lastMc = mcQs[3] || mcQs[0];
  add({ type: 'multiple_choice', ...lastMc });

  return { lessonId: id, exercises };
}

function generateDefaultMC(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const ex = lesson.grammar.examples?.[0];
  const sentence = typeof ex === 'string' ? ex : ex?.sentence || lesson.vocabulary[0].example;
  return [
    {
      question: `Choose the best sentence for this lesson (${lesson.title}):`,
      options: [sentence, sentence.replace(/\b(is|are|am|have|has|can|will)\b/i, 'XXX'), 'No correct form.', sentence.split(' ').reverse().join(' ')].slice(0, 4),
      answer: sentence,
      explanation: `This follows the pattern taught in ${lesson.grammar.title}.`,
      ruleId,
    },
    {
      question: `Which word fits the lesson topic "${lesson.title}"?`,
      options: [...lesson.vocabulary.slice(0, 3).map((v) => v.word), 'xyzabc'],
      answer: lesson.vocabulary[0].word,
      explanation: `"${lesson.vocabulary[0].word}" (${lesson.vocabulary[0].translation}) is key vocabulary for this lesson.`,
      ruleId: null,
    },
    {
      question: lesson.exerciseBank?.mcQuestion || `Complete using the lesson grammar: ${lesson.vocabulary[1]?.example?.replace(/\b(\w+)\b/, '___') || 'She ___ happy.'}`,
      options: lesson.exerciseBank?.mcOptions || ['is', 'are', 'am', 'be'],
      answer: lesson.exerciseBank?.mcAnswer || 'is',
      explanation: lesson.grammar.rule.slice(0, 150),
      ruleId,
    },
    {
      question: `What is the correct translation of "${lesson.vocabulary[2]?.word}"?`,
      options: [lesson.vocabulary[2]?.translation, lesson.vocabulary[0]?.translation, lesson.vocabulary[1]?.translation, 'none of these'],
      answer: lesson.vocabulary[2]?.translation,
      explanation: `"${lesson.vocabulary[2]?.word}" means "${lesson.vocabulary[2]?.translation}".`,
      ruleId: null,
    },
  ];
}

function generateDefaultFill(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const v = lesson.vocabulary;
  return [
    {
      question: `Complete: ${v[0]?.example?.replace(new RegExp(`\\b${v[0]?.word}\\b`, 'i'), '___') || 'Hello! My name ___ Ana.'}`,
      answer: v[0]?.word === 'hello' ? 'is' : (lesson.exerciseBank?.fill1 || 'is'),
      answers: lesson.exerciseBank?.fill1Answers || [lesson.exerciseBank?.fill1 || 'is'],
      explanation: 'Use the grammar from this lesson to complete the gap.',
      ruleId,
    },
    {
      question: `Complete: ${lesson.exerciseBank?.fill2Question || v[1]?.example?.replace(/\b(\w+)\b/, '___') || 'They ___ students.'}`,
      answer: lesson.exerciseBank?.fill2 || 'are',
      answers: lesson.exerciseBank?.fill2Answers || [lesson.exerciseBank?.fill2 || 'are'],
      explanation: lesson.grammar.rule.slice(0, 120),
      ruleId,
    },
    {
      question: `Complete: ${lesson.exerciseBank?.fill3Question || v[2]?.example?.replace(/\b(\w+)\b/, '___') || 'I ___ from Brazil.'}`,
      answer: lesson.exerciseBank?.fill3 || 'am',
      answers: lesson.exerciseBank?.fill3Answers || [lesson.exerciseBank?.fill3 || 'am'],
      explanation: 'Check subject–verb agreement from this lesson.',
      ruleId,
    },
  ];
}

function generateDefaultTF(lesson) {
  const ruleId = lesson.grammar.ruleId;
  return [
    {
      question: `True or false: ${lesson.exerciseBank?.tfTrue || `"${lesson.grammar.examples?.[0]?.sentence || lesson.vocabulary[0].example}" is a correct example for this lesson.`}`,
      answer: true,
      explanation: 'This sentence follows the grammar taught in this lesson.',
      ruleId,
    },
    {
      question: `True or false: ${lesson.exerciseBank?.tfFalse || lesson.grammar.commonMistakes?.[0]?.incorrect + ' is grammatically correct.'}`,
      answer: false,
      explanation: lesson.grammar.commonMistakes?.[0]?.explanation || 'This form is incorrect for this lesson.',
      ruleId,
    },
  ];
}

function generateDefaultMatching(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const pairs = lesson.vocabulary.slice(0, 4).map((v) => ({
    left: v.word,
    right: v.translation.split('/')[0].trim(),
  }));
  return [
    {
      question: 'Match each word with its Portuguese translation.',
      pairs,
      explanation: 'Review key vocabulary from this lesson.',
      ruleId: null,
    },
    {
      question: lesson.exerciseBank?.matchQuestion || 'Match each item with the correct category.',
      pairs: lesson.exerciseBank?.matchPairs || pairs,
      explanation: 'These pairs reinforce the lesson topic.',
      ruleId,
    },
  ];
}

function generateDefaultOrdering(lesson) {
  const words = (lesson.exerciseBank?.orderWords ||
    (lesson.vocabulary[0]?.example || 'Hello my name is Ana').split(/[\s,!.?]+/).filter(Boolean));
  return {
    question: 'Put the words in the correct order to make a sentence.',
    items: [...words].sort(() => Math.random() - 0.5),
    answer: words,
    explanation: 'Word order follows standard English patterns from this lesson.',
    ruleId: lesson.grammar.ruleId,
  };
}

function generateDefaultErrorCorrection(lesson) {
  const mistake = lesson.grammar.commonMistakes?.[0] || {
    incorrect: 'She are happy.',
    correct: 'She is happy.',
    explanation: 'Use is with she.',
  };
  return {
    question: `Find and correct the error: "${mistake.incorrect}"`,
    answer: mistake.correct,
    answers: [mistake.correct],
    explanation: mistake.explanation,
    ruleId: lesson.grammar.ruleId,
  };
}

export function buildCheckpoint(lesson, moduleId) {
  const ex = buildExercises(lesson).exercises;
  const picked = [ex[0], ex[3], ex[6], ex[1], ex[9]].map((e, i) => ({
    ...e,
    id: cpId(lesson.id, i + 1),
  }));
  return {
    id: `${lesson.id}-checkpoint`,
    kind: 'checkpoint',
    lessonId: lesson.id,
    moduleId,
    level: lesson.level,
    title: `Lesson ${lesson.order} Checkpoint — ${lesson.title}`,
    description: `Show what you learned about ${lesson.title.toLowerCase()}. You need at least 4 out of 5 correct to pass.`,
    passingScore: 4,
    totalQuestions: 5,
    canDo: lesson.canDo,
    questions: picked,
  };
}

export function buildLessonJson(lesson, moduleId) {
  const ruleId = lesson.grammar.ruleId;
  const checkpointId = `${lesson.id}-checkpoint`;
  const vocabRefs = lesson.vocabulary.slice(0, 6).map((v) => ({
    kind: 'vocab',
    ref: vocabId(v.word),
  }));

  return {
    id: lesson.id,
    moduleId,
    level: lesson.level,
    order: lesson.order,
    title: lesson.title,
    estimatedMinutes: lesson.estimatedMinutes || 40,
    objectives: lesson.objectives,
    canDo: lesson.canDo,
    warmUp: lesson.warmUp,
    explanation: lesson.explanation,
    grammar: {
      ruleId,
      title: lesson.grammar.title,
      rule: lesson.grammar.rule,
      table: lesson.grammar.table,
      examples: lesson.grammar.examples,
    },
    vocabulary: lesson.vocabulary.map((v) => ({
      word: v.word,
      translation: v.translation,
      partOfSpeech: v.partOfSpeech,
      example: v.example,
      collocations: v.collocations || [],
    })),
    examples: lesson.examples,
    practice: Array.from({ length: 12 }, (_, i) => exId(lesson.id, i + 1)),
    reading: lesson.reading,
    writing: lesson.writing,
    review: [
      { kind: 'grammar', ref: ruleId },
      ...vocabRefs,
      { kind: 'exercise', ref: exId(lesson.id, 1) },
      { kind: 'exercise', ref: exId(lesson.id, 10) },
    ],
    checkpointId,
    tutorHints: lesson.tutorHints,
    vocabularyRef: `vocabulary/${lesson.id}.json`,
    exercisesRef: `exercises/${lesson.id}.json`,
    grammarRef: `grammar/${ruleId}.json`,
    checkpointRef: `assessments/${checkpointId}.json`,
  };
}

export function buildModuleTest(module, lessons, level) {
  const questions = [];
  lessons.forEach((lesson, li) => {
    const ex = buildExercises(lesson).exercises;
    questions.push({ ...ex[li % ex.length], id: `mt_${module.id.replace(/-/g, '_')}_${String(questions.length + 1).padStart(2, '0')}` });
  });
  while (questions.length < 8) {
    const lesson = lessons[questions.length % lessons.length];
    const ex = buildExercises(lesson).exercises;
    questions.push({ ...ex[(questions.length + 2) % ex.length], id: `mt_${module.id.replace(/-/g, '_')}_${String(questions.length + 1).padStart(2, '0')}` });
  }

  return {
    id: `${module.id}-module-test`,
    kind: 'module',
    moduleId: module.id,
    level,
    title: `${module.title} — Module Test`,
    description: `Test your knowledge of the whole module: ${module.title}. You need at least 6 out of 8 correct to pass.`,
    passingScore: 6,
    totalQuestions: 8,
    canDo: module.canDoSummary,
    questions: questions.slice(0, 8),
  };
}

export function buildLevelTest(levelId, cefr, allLessons, modules) {
  const questions = [];
  modules.forEach((mod, mi) => {
    const modLessons = allLessons.filter((l) => l.moduleId === mod.id);
    modLessons.forEach((lesson, li) => {
      if (questions.length >= 12) return;
      const ex = buildExercises(lesson).exercises;
      questions.push({
        ...ex[(mi + li) % ex.length],
        id: `lt_${levelId}_${String(questions.length + 1).padStart(2, '0')}`,
      });
    });
  });

  return {
    id: `${levelId}-level-test`,
    kind: 'level',
    level: cefr,
    title: `${cefr} Level Test`,
    description: `Comprehensive ${cefr} test covering all modules. You need at least 8 out of 12 correct to pass.`,
    passingScore: 8,
    totalQuestions: 12,
    questions: questions.slice(0, 12),
  };
}

export function buildDiagnostic(a1Lessons, a2Lessons) {
  const topics = [];
  const pick = (lessons, count, band) => {
    const step = Math.max(1, Math.floor(lessons.length / count));
    for (let i = 0; i < count; i++) {
      const lesson = lessons[Math.min(i * step, lessons.length - 1)];
      const ex = buildExercises(lesson).exercises;
      const q = ex[i % ex.length];
      topics.push({
        ...q,
        id: `diag_${String(topics.length + 1).padStart(2, '0')}`,
        estimatedBand: band,
      });
    }
  };
  pick(a1Lessons, 10, 'A1');
  pick(a2Lessons, 10, 'A2');

  return {
    id: 'diagnostic',
    kind: 'diagnostic',
    title: 'English Journey Diagnostic Test',
    description: 'This test mixes A1 and A2 topics to estimate your starting level. There is no pass/fail score — answer honestly to get the best placement.',
    passingScore: 0,
    totalQuestions: 20,
    notes: 'Each question includes an estimatedBand (A1 or A2) based on topic difficulty. Score A1 questions separately from A2 questions to estimate placement.',
    questions: topics,
  };
}
