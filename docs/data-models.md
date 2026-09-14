# Data Models — English Journey

## Curriculum

`Level → Module → Lesson` em JSON sob `frontend/public/data/`.

## Exercise

Tipos: `multiple_choice`, `fill_blank`, `true_false`, `matching`, `ordering`, `error_correction`.

## Progress (Zustand)

`currentLevel`, `currentModuleId`, `currentLessonId`, `mastery`, `canDo`, `completedLessons`, `unlockedLessons`, `unlockedModules`, `diagnosticDone`.

## Mistake / Review

Erros individuais + fila SRS (`dueAt`, `intervalIndex`).

## Assessment kinds

`diagnostic` · `checkpoint` · `module` · `level`
