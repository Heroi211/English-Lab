#!/usr/bin/env node
/**
 * Generate full CEFR curriculum JSON for English Journey.
 * Run: node scripts/generate-curriculum.mjs
 */
import fs from 'fs';
import { A1_MODULES } from './curriculum/a1-content.mjs';
import { A2_MODULES } from './curriculum/a2-content.mjs';
import {
  DATA_ROOT,
  writeJson,
  readJsonIfExists,
  buildVocabularyFile,
  buildGrammarFile,
  buildExercises,
  buildCheckpoint,
  buildLessonJson,
  buildModuleTest,
  buildLevelTest,
  buildDiagnostic,
} from './curriculum/helpers.mjs';

const stats = {
  modules: 0,
  lessons: 0,
  exerciseFiles: 0,
  vocabularyFiles: 0,
  grammarRuleIds: new Set(),
  checkpointAssessments: 0,
  moduleTests: 0,
  levelTests: 0,
  diagnostic: 0,
};

const PRESERVE_LESSONS = new Set(['a1-m1-l1']);
const PRESERVE_GRAMMAR = new Set(['a1-verb-to-be']);

function levelPrefix(levelId) {
  return levelId;
}

function generateLevel(levelId, cefr, modules, meta) {
  const allLessons = [];

  // modules.json
  const modulesJson = {
    levelId,
    modules: modules.map((m) => ({
      id: m.id,
      levelId: m.levelId,
      order: m.order,
      title: m.title,
      description: m.description,
      lessons: m.lessons.map((l) => ({ id: l.id, order: l.order, title: l.title })),
      assessmentId: `${m.id}-module-test`,
      canDoSummary: m.canDoSummary,
    })),
  };
  writeJson(`curriculum/${levelId}/modules.json`, modulesJson);
  stats.modules += modules.length;

  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      allLessons.push(lesson);
      const lessonPath = `curriculum/${levelId}/lessons/${lesson.id}.json`;

      if (PRESERVE_LESSONS.has(lesson.id)) {
        const existing = readJsonIfExists(lessonPath);
        if (!existing) {
          writeJson(lessonPath, buildLessonJson(lesson, mod.id));
        }
      } else {
        writeJson(lessonPath, buildLessonJson(lesson, mod.id));
      }
      stats.lessons++;

      // vocabulary
      const vocabPath = `vocabulary/${lesson.id}.json`;
      if (PRESERVE_LESSONS.has(lesson.id)) {
        if (!readJsonIfExists(vocabPath)) {
          writeJson(vocabPath, buildVocabularyFile(lesson));
        }
      } else {
        writeJson(vocabPath, buildVocabularyFile(lesson));
      }
      stats.vocabularyFiles++;

      // exercises — always regenerate (quality depends on current factory)
      writeJson(`exercises/${lesson.id}.json`, buildExercises(lesson));
      stats.exerciseFiles++;

      // grammar
      const ruleId = lesson.grammar.ruleId;
      const grammarPath = `grammar/${ruleId}.json`;
      if (PRESERVE_GRAMMAR.has(ruleId)) {
        if (!readJsonIfExists(grammarPath)) {
          writeJson(grammarPath, buildGrammarFile(ruleId, lesson, cefr));
        }
      } else {
        const existing = readJsonIfExists(grammarPath);
        const grammarData = buildGrammarFile(ruleId, lesson, cefr);
        if (existing?.relatedLessons) {
          grammarData.relatedLessons = [...new Set([...existing.relatedLessons, lesson.id])];
        }
        writeJson(grammarPath, grammarData);
      }
      stats.grammarRuleIds.add(ruleId);

      // checkpoint
      writeJson(`assessments/${lesson.id}-checkpoint.json`, buildCheckpoint(lesson, mod.id));
      stats.checkpointAssessments++;
    }

    // module test
    writeJson(`assessments/${mod.id}-module-test.json`, buildModuleTest(mod, mod.lessons, cefr));
    stats.moduleTests++;
  }

  // level test
  writeJson(`assessments/${levelId}-level-test.json`, buildLevelTest(levelId, cefr, allLessons, modules));
  stats.levelTests++;

  return allLessons;
}

function main() {
  console.log(`Writing curriculum to ${DATA_ROOT}\n`);

  writeJson('curriculum/index.json', {
    levels: [
      {
        id: 'a1',
        cefr: 'A1',
        title: 'Foundation',
        description: 'Build core English from introductions to daily life — verb to be, present tenses, essential vocabulary, and simple communication.',
        order: 1,
        status: 'available',
      },
      {
        id: 'a2',
        cefr: 'A2',
        title: 'Consolidation',
        description: 'Strengthen past and future tenses, comparisons, modals, present perfect intro, and everyday phrasal verbs.',
        order: 2,
        status: 'available',
      },
      {
        id: 'b1',
        cefr: 'B1',
        title: 'Independent Use',
        description: 'Coming soon',
        order: 3,
        status: 'coming_soon',
      },
      {
        id: 'b2',
        cefr: 'B2',
        title: 'Upper Intermediate',
        description: 'Coming soon',
        order: 4,
        status: 'coming_soon',
      },
    ],
    modules: {
      a1: '/data/curriculum/a1/modules.json',
      a2: '/data/curriculum/a2/modules.json',
    },
  });

  const a1Lessons = generateLevel('a1', 'A1', A1_MODULES);
  const a2Lessons = generateLevel('a2', 'A2', A2_MODULES);

  writeJson('assessments/diagnostic.json', buildDiagnostic(a1Lessons, a2Lessons));
  stats.diagnostic = 1;

  const oldLevels = `${DATA_ROOT}/curriculum/levels.json`;
  if (fs.existsSync(oldLevels)) {
    console.log('Note: curriculum/levels.json exists — index.json is now the canonical level index.');
  }

  console.log('Generation complete!\n');
  console.log('Counts:');
  console.log(`  Modules:              ${stats.modules} (16 total: 8 A1 + 8 A2)`);
  console.log(`  Lessons:              ${stats.lessons}`);
  console.log(`  Exercise files:       ${stats.exerciseFiles}`);
  console.log(`  Vocabulary files:     ${stats.vocabularyFiles}`);
  console.log(`  Grammar files:        ${stats.grammarRuleIds.size} (unique rule files)`);
  console.log(`  Checkpoint tests:     ${stats.checkpointAssessments}`);
  console.log(`  Module tests:         ${stats.moduleTests}`);
  console.log(`  Level tests:          ${stats.levelTests}`);
  console.log(`  Diagnostic tests:     ${stats.diagnostic}`);
  console.log(`\nTotal assessment files: ${stats.checkpointAssessments + stats.moduleTests + stats.levelTests + stats.diagnostic}`);
}

main();
