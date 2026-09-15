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

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    ;[a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sentenceOf(ex) {
  if (!ex) return '';
  return typeof ex === 'string' ? ex : ex.sentence || '';
}

function gapFirstToken(sentence, token) {
  if (!sentence || !token) return null;
  const re = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  if (!re.test(sentence)) return null;
  return sentence.replace(re, '___');
}

/** Plausible same-class distractors — never nonsense tokens. */
function distractorsFor(answer, pool, count = 3) {
  const a = String(answer);
  const uniq = [...new Set(pool.map(String).filter((x) => x.toLowerCase() !== a.toLowerCase()))];
  const picked = uniq.slice(0, count);
  while (picked.length < count) {
    const fillers = ['is', 'are', 'am', 'do', 'does', 'have', 'has', 'was', 'were', 'can', 'to', 'the'];
    const f = fillers.find((x) => !picked.includes(x) && x.toLowerCase() !== a.toLowerCase());
    if (!f) break;
    picked.push(f);
  }
  return seededShuffle([a, ...picked.slice(0, count)], hashSeed(a + picked.join(',')));
}

export function buildExercises(lesson) {
  const { id, level, grammar, topic } = lesson;
  const ruleId = grammar.ruleId;
  const topicSlug = slugTopic(topic || lesson.title);
  const lessonNum = parseInt(id.split('-l').pop(), 10) || 1;
  const exercises = [];
  let n = 1;

  const add = (ex) => {
    const { ruleId: r, ...rest } = ex;
    exercises.push({
      id: exId(id, n++),
      level,
      topic: topicSlug,
      ruleId: r === undefined ? ruleId : r,
      ...rest,
    });
  };

  // Optional fully authored bank (preferred for quality lessons).
  if (Array.isArray(lesson.exerciseBank?.exercises) && lesson.exerciseBank.exercises.length >= 8) {
    lesson.exerciseBank.exercises.slice(0, 12).forEach((q) => add(q));
    while (exercises.length < 12) {
      const pad = generateReadingApplied(lesson)[exercises.length % 3] || generateDefaultTF(lesson)[0];
      add({ ...pad, type: pad.type || 'true_false' });
    }
    return { lessonId: id, exercises: exercises.slice(0, 12) };
  }

  const mcQs = lesson.exerciseBank?.multipleChoice || generateDefaultMC(lesson);
  mcQs.slice(0, 3).forEach((q) => add({ type: 'multiple_choice', ...q }));

  const fills = lesson.exerciseBank?.fillBlank || generateDefaultFill(lesson);
  fills.slice(0, 3).forEach((q) => add({ type: 'fill_blank', ...q }));

  const tfs = lesson.exerciseBank?.trueFalse || generateDefaultTF(lesson);
  tfs.slice(0, 2).forEach((q) => add({ type: 'true_false', ...q }));

  const matches = lesson.exerciseBank?.matching || generateDefaultMatching(lesson);
  matches.slice(0, 2).forEach((q) => add({ type: 'matching', ...q }));

  if (lessonNum % 2 === 0) {
    const ord = lesson.exerciseBank?.ordering || generateDefaultOrdering(lesson);
    add({ type: 'ordering', ...ord });
  } else {
    const ec = lesson.exerciseBank?.errorCorrection || generateDefaultErrorCorrection(lesson);
    add({ type: 'error_correction', ...ec });
  }

  // Applied reading / context MC (not meta “lesson topic” questions)
  const applied = lesson.exerciseBank?.applied || generateReadingApplied(lesson);
  add({ type: 'multiple_choice', ...(applied[0] || mcQs[0]) });

  return { lessonId: id, exercises };
}

function generateReadingApplied(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const text = lesson.reading?.text || '';
  const rq = (lesson.reading?.questions || []).find((q) => q.type === 'multiple_choice' && Array.isArray(q.options) && q.options.length >= 3);
  if (rq) {
    const opts = [...rq.options].filter((o) => !/^xyz|^abc$/i.test(String(o)));
    while (opts.length < 4) opts.push(opts[0] === 'yes' ? 'no' : 'not mentioned');
    return [
      {
        question: `From the reading "${lesson.reading.title}": ${rq.question}`,
        options: opts.slice(0, 4),
        answer: rq.answer,
        explanation: rq.explanation || 'Use evidence from the reading text.',
        ruleId,
      },
    ];
  }

  const ex = sentenceOf(lesson.grammar.examples?.[0]) || lesson.vocabulary?.[0]?.example || 'I am a student.';
  const words = ex.split(/\s+/);
  const target = words.find((w) => /^(am|is|are|have|has|can|do|does|I|you|he|she|it|we|they)$/i.test(w)) || words[0];
  const gapped = gapFirstToken(ex, target.replace(/[.,!?]/g, '')) || `___ ${words.slice(1).join(' ')}`;
  const pool = ['am', 'is', 'are', 'I', 'you', 'he', 'she', 'it', 'we', 'they', 'have', 'has'];
  return [
    {
      question: `Apply the grammar: ${gapped}`,
      options: distractorsFor(target.replace(/[.,!?]/g, ''), pool),
      answer: target.replace(/[.,!?]/g, ''),
      explanation: lesson.grammar.rule.slice(0, 160),
      ruleId,
    },
  ];
}

function generateDefaultMC(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const v = lesson.vocabulary || [];
  const examples = (lesson.grammar.examples || []).map(sentenceOf).filter(Boolean);
  const s0 = examples[0] || v[0]?.example || 'I am a student.';
  const s1 = examples[1] || v[1]?.example || 'She is a teacher.';
  const mistake = lesson.grammar.commonMistakes?.[0];

  // MC1: choose the only grammatical sentence (real alternatives, no XXX)
  const bad1 = mistake?.incorrect || s0.replace(/\bam\b/i, 'is').replace(/\bis\b/i, 'are').replace(/\bare\b/i, 'am');
  const bad2 = s0.replace(/\b(I|You|He|She|It|We|They)\b/, 'Me');
  const opts1 = seededShuffle([s0, bad1, bad2, 'The form is incomplete.'], hashSeed(lesson.id + 'mc1'));

  // MC2: gap with unique answer from context sentence
  const gapWord =
    (s1.match(/\b(am|is|are|have|has|can|do|does)\b/i) || [])[0] ||
    (s1.match(/\b(I|you|he|she|it|we|they)\b/i) || [])[0] ||
    'is';
  const gapped = gapFirstToken(s1, gapWord) || `She ___ happy.`;
  const opts2 = distractorsFor(gapWord, ['am', 'is', 'are', 'have', 'has', 'do', 'does', 'be', 'was']);

  // MC3: meaning / form with one clear key
  const key = v[2] || v[0];
  const wrongTrans = v.filter((x) => x.word !== key?.word).slice(0, 2).map((x) => x.translation.split('/')[0].trim());
  const opts3 = seededShuffle(
    [key?.translation?.split('/')[0].trim() || '—', ...wrongTrans, 'not used in this grammar'].slice(0, 4),
    hashSeed(lesson.id + 'mc3'),
  );

  // MC4: error recognition
  const wrong = mistake?.incorrect || bad1;
  const right = mistake?.correct || s0;

  return [
    {
      question: 'Which sentence is grammatically correct?',
      options: opts1,
      answer: s0,
      explanation: `Correct pattern for ${lesson.grammar.title}: ${lesson.grammar.rule.slice(0, 120)}`,
      ruleId,
    },
    {
      question: `Choose the word that correctly completes the sentence: ${gapped}`,
      options: opts2,
      answer: gapWord,
      explanation: lesson.grammar.rule.slice(0, 150),
      ruleId,
    },
    {
      question: `What does "${key?.word}" mean?`,
      options: opts3,
      answer: key?.translation?.split('/')[0].trim(),
      explanation: `"${key?.word}" → ${key?.translation}.`,
      ruleId: null,
    },
    {
      question: `Which option corrects this mistake: "${wrong}"?`,
      options: seededShuffle([right, wrong, bad2, s1], hashSeed(lesson.id + 'mc4')).slice(0, 4),
      answer: right,
      explanation: mistake?.explanation || 'Compare subject and verb carefully.',
      ruleId,
    },
  ];
}

function generateDefaultFill(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const bank = lesson.exerciseBank || {};
  const examples = (lesson.grammar.examples || []).map(sentenceOf).filter(Boolean);
  const v = lesson.vocabulary || [];

  const builds = [];

  if (bank.fill1Question && bank.fill1) {
    builds.push({
      question: bank.fill1Question.startsWith('Complete') ? bank.fill1Question : `Complete: ${bank.fill1Question}`,
      answer: bank.fill1,
      answers: bank.fill1Answers || [bank.fill1],
      explanation: bank.fill1Explanation || lesson.grammar.rule.slice(0, 120),
      ruleId,
    });
  }
  if (bank.fill2Question && bank.fill2) {
    builds.push({
      question: bank.fill2Question.startsWith('Complete') ? bank.fill2Question : `Complete: ${bank.fill2Question}`,
      answer: bank.fill2,
      answers: bank.fill2Answers || [bank.fill2],
      explanation: bank.fill2Explanation || lesson.grammar.rule.slice(0, 120),
      ruleId,
    });
  }
  if (bank.fill3Question && bank.fill3) {
    builds.push({
      question: bank.fill3Question.startsWith('Complete') ? bank.fill3Question : `Complete: ${bank.fill3Question}`,
      answer: bank.fill3,
      answers: bank.fill3Answers || [bank.fill3],
      explanation: bank.fill3Explanation || 'Check agreement and form.',
      ruleId,
    });
  }

  const autoCandidates = [
    ...examples.map((s) => {
      const m = s.match(/\b(am|is|are|have|has|can|do|does|I|you|he|she|it|we|they)\b/);
      if (!m) return null;
      return { q: gapFirstToken(s, m[0]), a: m[0] };
    }),
    ...v.slice(0, 4).map((item) => {
      const m = item.example?.match(/\b(am|is|are|have|has|I|you|he|she|it|we|they)\b/);
      if (!m) return null;
      return { q: gapFirstToken(item.example, m[0]), a: m[0] };
    }),
  ].filter((x) => x?.q);

  for (const c of autoCandidates) {
    if (builds.length >= 3) break;
    if (builds.some((b) => b.question.includes(c.q))) continue;
    builds.push({
      question: `Complete: ${c.q}`,
      answer: c.a,
      answers: [c.a, c.a.toLowerCase(), c.a[0].toUpperCase() + c.a.slice(1).toLowerCase()],
      explanation: lesson.grammar.rule.slice(0, 140),
      ruleId,
    });
  }

  while (builds.length < 3) {
    builds.push({
      question: 'Complete: She ___ a teacher.',
      answer: 'is',
      answers: ['is'],
      explanation: 'Use is with he/she/it.',
      ruleId,
    });
  }

  return builds.slice(0, 3);
}

function generateDefaultTF(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const good = sentenceOf(lesson.grammar.examples?.[0]) || lesson.vocabulary?.[0]?.example || 'I am a student.';
  const mistake = lesson.grammar.commonMistakes?.[0];
  return [
    {
      question: `True or false: "${good}" is correct English.`,
      answer: true,
      explanation: 'This sentence follows the target grammar.',
      ruleId,
    },
    {
      question: `True or false: "${mistake?.incorrect || 'She are happy.'}" is correct English.`,
      answer: false,
      explanation: mistake?.explanation || `Use the correct form: ${mistake?.correct || 'She is happy.'}`,
      ruleId,
    },
  ];
}

function generateDefaultMatching(lesson) {
  const ruleId = lesson.grammar.ruleId;
  const pairs = (lesson.vocabulary || []).slice(0, 4).map((v) => ({
    left: v.word,
    right: v.translation.split('/')[0].trim(),
  }));
  const formPairs =
    lesson.exerciseBank?.matchPairs ||
    (lesson.grammar.table?.rows || []).slice(0, 4).map((row) => ({
      left: String(row[0]),
      right: String(row[1] || row[row.length - 1]),
    }));

  return [
    {
      question: 'Match each English item with its Portuguese meaning.',
      pairs: pairs.length ? pairs : formPairs,
      explanation: 'Review the core vocabulary for this skill.',
      ruleId: null,
    },
    {
      question: lesson.exerciseBank?.matchQuestion || 'Match the related forms or meanings.',
      pairs: formPairs.length >= 2 ? formPairs.slice(0, 4) : pairs,
      explanation: 'These pairs reinforce the grammar or vocabulary of the skill.',
      ruleId,
    },
  ];
}

function generateDefaultOrdering(lesson) {
  let words;
  if (Array.isArray(lesson.exerciseBank?.orderWords)) {
    words = lesson.exerciseBank.orderWords.map(String).filter(Boolean).slice(0, 8);
  } else {
    const raw =
      lesson.exerciseBank?.orderWords ||
      sentenceOf(lesson.grammar.examples?.[0]) ||
      lesson.vocabulary?.[0]?.example ||
      'I am a student';
    words = String(raw)
      .replace(/[.,!?]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8);
  }

  const seed = hashSeed(lesson.id + words.join(''));
  const items = seededShuffle(words, seed);
  // Ensure items are not identical to the correct order (so the task is real).
  const shuffled = items.join(' ') === words.join(' ') ? seededShuffle(words, seed + 7) : items;

  return {
    question: 'Put the words in the correct order to make a sentence.',
    items: shuffled,
    correctOrder: words,
    answer: words,
    explanation: 'English word order is usually Subject + Verb + Complement.',
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
    answers: [mistake.correct, mistake.correct.replace(/\.$/, '')],
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
