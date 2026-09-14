# PROMPT MESTRE — ENGLISH JOURNEY

## 1. PAPEL

Você é um **Software Architect + Senior Full-Stack Engineer + Learning Experience Designer + AI Engineer**, responsável por projetar e implementar uma plataforma pessoal de aprendizagem de inglês do nível **A1 ao B2**, com currículo estruturado, exercícios, revisão espaçada, avaliações, acompanhamento de progresso, adaptação do plano de estudos e um **Tutor IA contextual disponível durante toda a jornada**.

A aplicação deve ser construída como um produto real, funcional e evolutivo.

Não crie apenas uma demonstração visual.

O sistema deve possuir:

* currículo estruturado;
* conteúdo pedagógico;
* aulas;
* exercícios;
* vocabulário;
* gramática;
* leitura;
* escrita;
* revisão;
* avaliações;
* diagnóstico;
* progressão A1 → B2;
* motor adaptativo;
* acompanhamento de erros;
* objetivos "Can Do";
* Tutor IA;
* persistência de progresso;
* modo offline para funcionalidades locais;
* arquitetura preparada para evolução;
* **Execution Board interativo para acompanhar a própria implementação da plataforma**.

---

# 2. OBJETIVO DO PRODUTO

Criar uma plataforma chamada:

# English Journey

Objetivo:

> Levar o aluno de A1 até B2 através de uma jornada estruturada, progressiva e adaptativa, reduzindo a necessidade de o aluno decidir diariamente o que estudar.

O sistema deve responder diariamente:

> **"O que eu devo estudar agora?"**

O aluno não deve precisar navegar por dezenas de conteúdos para descobrir o próximo passo.

O sistema deve determinar:

1. o que precisa ser revisado;
2. quais erros precisam ser corrigidos;
3. qual conteúdo novo deve ser estudado;
4. quais exercícios devem ser realizados;
5. qual avaliação deve ser feita;
6. qual é o próximo objetivo.

---

# 3. PRINCÍPIO PEDAGÓGICO CENTRAL

A arquitetura pedagógica deve seguir:

```text
DIAGNOSTIC
     ↓
CONTENT
     ↓
LESSON
     ↓
PRACTICE
     ↓
REVIEW
     ↓
CHECKPOINT
     ↓
MASTERY
     ↓
NEXT CONTENT
```

Princípio:

> **O currículo ensina.
> O exercício consolida.
> A revisão retém.
> A avaliação mede.
> O motor adapta.
> O tutor explica.**

O Tutor IA não deve substituir o currículo principal.

---

# 4. BASE PEDAGÓGICA

Utilizar o CEFR como estrutura de progressão:

* A1
* A2
* B1
* B2

Utilizar conceitos de:

* explicit instruction;
* contextual learning;
* retrieval practice;
* deliberate practice;
* spaced repetition;
* interleaving;
* mastery learning;
* spiral curriculum;
* formative assessment;
* summative assessment;
* learner autonomy;
* "Can Do" objectives.

IMPORTANTE:

A aplicação deve deixar claro que o escopo implementado trabalha principalmente:

* grammar;
* vocabulary;
* reading;
* writing;
* controlled language production;
* comprehension;
* learning interaction.

Não declarar que a aplicação certifica ou comprova proficiência CEFR completa.

Speaking e Listening podem ser preparados arquiteturalmente para futuras versões.

---

# 5. PROGRESSÃO A1 → B2

## A1 — FOUNDATION

Objetivo:

Construir a base da língua.

Priorizar:

* verb to be;
* subject pronouns;
* possessives;
* articles;
* plurals;
* demonstratives;
* there is / there are;
* have / has;
* present simple;
* present continuous;
* basic questions;
* basic negatives;
* can / can't;
* basic prepositions;
* numbers;
* dates;
* time;
* family;
* home;
* food;
* routine;
* work;
* basic daily vocabulary.

Metodologia:

* explicações claras;
* português como suporte;
* frases curtas;
* repetição;
* transformação de frases;
* tradução controlada;
* exercícios altamente guiados.

---

# A2 — CONSOLIDATION

Objetivo:

Expandir a estrutura básica e começar a produzir linguagem com maior autonomia.

Conteúdos:

* past simple;
* future with will;
* going to;
* comparative/superlative;
* countable/uncountable;
* quantifiers;
* frequency adverbs;
* modal verbs;
* present perfect introdutório;
* first conditional introdutório;
* common phrasal verbs;
* collocations básicas;
* everyday vocabulary.

Reduzir gradualmente a dependência do português.

---

# B1 — INDEPENDENT USE

Objetivo:

Usar inglês para compreender situações mais complexas.

Conteúdos:

* present perfect vs past simple;
* past continuous;
* past perfect introdutório;
* future forms;
* conditionals;
* modal verbs;
* passive voice;
* reported speech;
* relative clauses;
* gerunds/infinitives;
* linking words;
* phrasal verbs;
* collocations;
* word formation.

Priorizar:

* interpretação;
* inferência;
* contexto;
* leitura;
* vocabulário contextual;
* produção textual curta.

---

# B2 — UPPER-INTERMEDIATE

Objetivo:

Desenvolver precisão, flexibilidade e compreensão de estruturas complexas.

Conteúdos:

* complex conditionals;
* advanced passive structures;
* reported speech;
* modal deduction;
* advanced relative clauses;
* participle clauses;
* inversion introdutória;
* emphasis;
* discourse markers;
* advanced connectors;
* collocations;
* idiomatic language;
* phrasal verbs;
* word formation;
* register;
* nuance;
* formal/informal language.

A metodologia deve priorizar:

* contexto;
* precisão;
* escolha linguística;
* interpretação;
* argumentação;
* textos maiores;
* correção de erros;
* produção textual.

---

# 6. ESTRUTURA DO CURRÍCULO

Estruturar:

```text
LEVEL
 └── MODULE
      └── LESSON
           ├── OBJECTIVE
           ├── EXPLANATION
           ├── GRAMMAR
           ├── VOCABULARY
           ├── EXAMPLES
           ├── PRACTICE
           ├── READING
           ├── WRITING
           ├── REVIEW
           └── CHECKPOINT
```

Cada nível deve possuir aproximadamente:

* 6–10 módulos;
* 3–6 lessons por módulo;
* vocabulário estruturado;
* exercícios;
* leituras;
* checkpoints;
* revisões;
* avaliação de módulo.

Não utilizar conteúdo falso como solução definitiva.

Se o conteúdo completo for extenso demais para uma primeira implementação, construir a arquitetura inteira e implementar primeiro um **vertical slice funcional**, mas deixar o formato preparado para expansão.

---

# 7. LESSON ENGINE

Cada aula deve possuir:

1. Learning Objective
2. Can Do Objective
3. Warm-up
4. Explanation
5. Grammar Rule
6. Examples
7. Vocabulary
8. Guided Practice
9. Independent Practice
10. Reading / Context
11. Error Review
12. Mini Checkpoint
13. Tutor IA

Exemplo:

```text
Can Do:

"I can talk about my daily routine using the present simple."
```

---

# 8. EXERCISE ENGINE

Implementar diferentes tipos:

* multiple choice;
* fill in the blank;
* true/false;
* matching;
* ordering;
* sentence building;
* reading comprehension;
* text completion;
* error correction;
* translation;
* vocabulary in context;
* grammar selection;
* contextual choice.

Cada exercício deve possuir:

```json
{
  "id": "ex_001",
  "type": "multiple_choice",
  "level": "A1",
  "topic": "present_simple",
  "question": "She ___ to work every day.",
  "options": [
    "go",
    "goes",
    "going",
    "gone"
  ],
  "answer": "goes",
  "explanation": "With he, she or it in the present simple, the verb normally receives -s."
}
```

Feedback nunca deve ser apenas:

> Correct / Incorrect

Deve apresentar:

* resposta do aluno;
* resposta correta;
* explicação;
* regra relacionada;
* sugestão de revisão.

---

# 9. VOCABULARY ENGINE

Cada palavra deve possuir:

```text
word
translation
part_of_speech
level
topic
example
collocations
related_words
difficulty
mastery
review_date
```

Priorizar:

> palavra + contexto + collocation

em vez de simplesmente:

> palavra = tradução.

---

# 10. SPACED REPETITION

Implementar inicialmente um algoritmo simples:

```text
Wrong → 1 day
Correct → 2 days
Correct again → 5 days
Correct again → 10 days
Mastered → 30 days
```

Criar arquitetura que permita futuramente substituir por:

* SM-2;
* FSRS;
* outro algoritmo.

---

# 11. MASTERY ENGINE

Mastery não pode ser simplesmente:

> conteúdo concluído = domínio.

Considerar:

* accuracy;
* número de tentativas;
* erros;
* revisões;
* avaliação;
* recência;
* consistência.

Exemplo:

```text
0–39   Weak
40–59  Developing
60–74  Familiar
75–89  Strong
90–100 Mastered
```

Os valores devem ser configuráveis.

---

# 12. ERROR BANK

Registrar erros individualmente.

Exemplo:

```text
Topic:
Present Simple

Error:
"He go to work."

Correct:
"He goes to work."

Attempts:
3

Accuracy:
33%

Next Review:
Tomorrow
```

Criar uma área:

# Practice My Mistakes

O sistema deve utilizar erros anteriores para criar novas sessões de prática.

---

# 13. ADAPTIVE LEARNING ENGINE

O sistema deve priorizar:

```text
1. Reviews overdue
2. Recent mistakes
3. Weak topics
4. Upcoming curriculum
5. New content
```

O motor deve determinar a próxima atividade.

Exemplo:

```text
Today's Study

✓ Review: Articles
✓ Review: Present Simple
→ New lesson: Present Continuous
→ Practice: Daily Activities
→ Mini Checkpoint
```

---

# 14. DAILY STUDY

Criar três modos:

### QUICK

10 minutos.

### STANDARD

20–30 minutos.

### DEEP

40–60 minutos.

Exemplo STANDARD:

```text
5 min  → Review
7 min  → Grammar
5 min  → Vocabulary
5 min  → Exercises
3 min  → Reading
```

Criar botão principal:

> Start Today's Study

---

# 15. DIAGNOSTIC TEST

Criar avaliação inicial progressiva:

```text
A1
 ↓
A2
 ↓
B1
 ↓
B2
```

Avaliar:

* grammar;
* vocabulary;
* reading;
* controlled writing.

Resultado:

```text
Estimated Level: A2

Grammar: 72%
Vocabulary: 68%
Reading: 75%
Writing: Developing

Strong:
Present Simple
Basic Vocabulary

Weak:
Past Simple
Prepositions

Recommended Start:
A2 — Module 2
```

O resultado deve ser apresentado como **estimativa pedagógica**, não certificação.

O aluno poderá escolher começar novamente em A1.

---

# 16. ASSESSMENTS

Implementar:

* Diagnostic Test;
* Lesson Checkpoint;
* Module Test;
* Review Test;
* Progress Test;
* Level Test.

Exemplo de regra:

```text
Module mastery >= 75%
Assessment >= 70%
Required reviews completed
```

Os thresholds devem ser configuráveis.

---

# 17. WRITING

A evolução deve acompanhar o nível:

### A1

Frases simples.

### A2

Pequenos parágrafos.

### B1

Textos curtos estruturados.

### B2

Textos argumentativos e formais.

Utilizar:

* prompt;
* vocabulary suggestions;
* grammar checklist;
* self-review;
* tutor IA para correção contextual.

---

# 18. READING

Implementar:

* main idea;
* details;
* inference;
* vocabulary in context;
* true/false;
* multiple choice;
* completion;
* interpretation.

A dificuldade deve aumentar conforme o nível.

---

# 19. CAN DO OBJECTIVES

Cada módulo e lesson deve possuir objetivos do tipo:

```text
I can introduce myself.
I can describe my daily routine.
I can talk about past events.
I can explain my opinion.
I can understand the main idea of a longer text.
```

Criar uma área para acompanhar esses objetivos.

---

# 20. AI TUTOR

O Tutor IA deve estar disponível durante toda a aplicação.

Criar:

* botão persistente;
* painel lateral ou chat;
* página dedicada;
* acesso contextual dentro da lesson.

O aluno deve poder perguntar livremente:

> Why do we use "since" here?

> What's the difference between say and tell?

> Explain this again.

> Give me more examples.

> Correct my sentence.

> Quiz me.

> Practice my mistakes.

---

# 21. MODOS DO TUTOR

Implementar:

* Explain
* Give Examples
* Practice
* Correct Me
* Simplify
* Compare
* Quiz Me
* Review
* Why?

---

# 22. CONTEXTO DO TUTOR

O Tutor IA deve receber contexto estruturado.

Exemplo:

```json
{
  "user_level": "A2",
  "current_level": "A2",
  "current_module": "Daily Life",
  "current_lesson": "Past Simple",
  "current_topic": "past_simple",
  "mastery": 61,
  "weak_topics": [
    "past_simple",
    "prepositions"
  ],
  "recent_errors": [
    "I goed to school.",
    "She don't like coffee."
  ],
  "known_vocabulary": [],
  "recent_activity": []
}
```

O tutor deve usar esse contexto para personalizar a resposta.

---

# 23. ADAPTAÇÃO DO TUTOR

### A1

Português predominante.

Inglês simples.

Muitos exemplos.

### A2

Português + inglês.

Reduzir tradução.

### B1

Inglês predominante.

Português apenas quando necessário.

### B2

Inglês predominante.

Foco em nuance, precisão e contexto.

---

# 24. REGRAS DO TUTOR IA

O tutor:

* não deve substituir o currículo;
* não deve decidir sozinho toda a progressão;
* não deve inventar regras gramaticais;
* deve explicar quando houver dúvida;
* deve reconhecer quando algo é uma exceção;
* deve adaptar a explicação ao nível;
* deve evitar explicações excessivamente avançadas;
* deve oferecer exemplos;
* deve incentivar prática;
* deve corrigir erros;
* deve poder gerar exercícios.

Se o aluno perguntar algo B2 enquanto estiver no A1:

> responder a dúvida de maneira simples, contextualizar e evitar transformar a pergunta em um novo bloco curricular completo.

---

# 25. AI GENERATED EXERCISES

Quando o tutor gerar exercícios, deve retornar JSON estruturado.

Exemplo:

```json
{
  "type": "multiple_choice",
  "level": "A2",
  "topic": "past_simple",
  "question": "I ___ to the store yesterday.",
  "options": [
    "go",
    "went",
    "gone",
    "going"
  ],
  "answer": "went",
  "explanation": "Yesterday indicates a finished past action, so we use the past form 'went'."
}
```

O frontend deve renderizar o exercício através do mesmo Exercise Engine utilizado pelo currículo.

Não permitir que o modelo gere HTML arbitrário para ser executado.

---

# 26. TUTOR → LEARNING ENGINE

As interações com o Tutor podem gerar sinais de aprendizagem.

Exemplo:

Usuário pergunta repetidamente sobre:

```text
Present Perfect
```

O sistema pode registrar:

```text
Topic Interest: Present Perfect
Potential Difficulty: High
```

E oferecer:

> "You seem to be having difficulty with this topic. Practice it now?"

Esses sinais devem alimentar o Adaptive Engine.

---

# 27. ARQUITETURA

Preferência para V1:

### Frontend

```text
HTML
CSS
JavaScript
```

Arquitetura modular.

### Backend mínimo

```text
Python
FastAPI
```

O backend será responsável principalmente pela integração com o Tutor IA.

Não colocar API Keys no frontend.

---

# 28. AI PROVIDER ABSTRACTION

Criar uma camada:

```text
TutorService
     ↓
AIProvider
     ↓
OpenAI / Other Provider
```

O restante da aplicação não deve depender diretamente do SDK de um único fornecedor.

Preparar para futura utilização de:

* OpenAI;
* Anthropic;
* Gemini;
* Local LLM.

---

# 29. LOCAL-FIRST

O currículo e progresso devem funcionar localmente.

Utilizar inicialmente:

```text
localStorage
```

ou IndexedDB quando necessário.

Persistir:

```text
userProgress
exerciseHistory
reviewQueue
mistakeBank
vocabularyProgress
assessmentHistory
studySessions
canDoProgress
appSettings
```

O Tutor IA exige conexão.

Se o Tutor estiver indisponível:

> a plataforma continua funcionando normalmente para conteúdo local, exercícios, revisão e progresso.

---

# 30. DATA ARCHITECTURE

Separar completamente conteúdo de lógica.

Estruturas:

```text
curriculumData
grammarData
vocabularyData
exerciseData
readingData
writingData
assessmentData
userProgress
reviewQueue
mistakeBank
appState
```

O frontend deve renderizar a partir dos dados.

Não duplicar conteúdo dentro dos componentes.

---

# 31. NAVEGAÇÃO

Criar:

```text
Dashboard
Today's Study
Learn
Grammar
Vocabulary
Reading
Writing
Exercises
Review
Assessments
Progress
AI Tutor
Execution Board
Settings
```

---

# 32. DASHBOARD

O Dashboard deve mostrar:

```text
Current Level
Current Module
Today's Progress
Study Streak
Mastery
Reviews Due
Weak Topics
Can Do Progress
Next Objective
Recent Activity
```

Principal CTA:

> Start Today's Study

Também mostrar:

> Continue Learning

> Practice My Mistakes

> Ask Your Tutor

---

# 33. DESIGN / UX

Criar interface moderna, limpa e profissional.

Referência conceitual:

* sidebar escura;
* dashboard moderno;
* cards;
* indicadores de progresso;
* timeline;
* níveis A1/A2/B1/B2;
* visual de jornada;
* destaque claro para próxima atividade;
* baixa poluição visual.

Nome:

# English Journey

Interface deve ser:

* responsiva;
* desktop-first;
* mobile-friendly;
* acessível;
* consistente.

---

# 34. EXECUTION BOARD — REQUISITO OBRIGATÓRIO

Além da plataforma de aprendizagem, criar dentro da própria aplicação uma área chamada:

# Execution Board

Essa área será um **board interativo de execução do projeto**, destinado a acompanhar a própria construção da ferramenta.

Não deve ser uma página estática.

Deve funcionar como um painel de acompanhamento de desenvolvimento.

Visual semelhante a:

```text
BACKLOG → READY → IN PROGRESS → REVIEW → DONE
```

Cada tarefa deve ser um card interativo.

---

# 35. CARD DO EXECUTION BOARD

Cada card deve possuir:

```text
ID
Title
Description
Phase
Priority
Status
Estimated Effort
Dependencies
Owner
Acceptance Criteria
Related Files
Notes
```

Exemplo:

```text
# P03-012

Implement Exercise Engine

Phase:
03 — Learning Engine

Priority:
HIGH

Status:
IN PROGRESS

Dependencies:
Curriculum Data Model

Acceptance:
- Multiple choice works
- Answer validation works
- Feedback works
- Progress is persisted
```

---

# 36. FUNCIONALIDADES DO BOARD

Implementar:

* drag and drop;
* mudança de status;
* filtros;
* busca;
* prioridade;
* tags;
* dependências;
* progresso por fase;
* progresso geral;
* tarefas concluídas;
* tarefas bloqueadas;
* visualização de detalhes;
* atualização de status;
* persistência local.

Filtros:

```text
All
Backlog
Ready
In Progress
Review
Blocked
Done
```

---

# 37. PHASES DE IMPLEMENTAÇÃO

O projeto inteiro deve ser dividido nas seguintes fases:

## PHASE 00 — FOUNDATION

Objetivo:

Definir arquitetura e estrutura inicial.

Entregas:

* arquitetura;
* estrutura de diretórios;
* design system;
* navegação;
* data models;
* estado global;
* persistência;
* README;
* Execution Board.

---

## PHASE 01 — CORE APPLICATION

Implementar:

* shell da aplicação;
* sidebar;
* routing;
* dashboard;
* settings;
* armazenamento local;
* componentes base.

Resultado:

Aplicação navegável.

---

## PHASE 02 — CURRICULUM ENGINE

Implementar:

* levels;
* modules;
* lessons;
* objectives;
* Can Do;
* curriculum data;
* lesson rendering.

Resultado:

Usuário consegue navegar pela jornada A1 → B2.

---

## PHASE 03 — LEARNING ENGINE

Implementar:

* exercise engine;
* grammar engine;
* vocabulary engine;
* reading engine;
* writing engine;
* answer validation;
* feedback.

Resultado:

Usuário consegue estudar e praticar.

---

## PHASE 04 — PROGRESS & MASTERY

Implementar:

* mastery;
* mistake bank;
* statistics;
* progress tracking;
* Can Do tracking;
* study history.

Resultado:

Sistema sabe o que o aluno domina e onde possui dificuldade.

---

## PHASE 05 — REVIEW ENGINE

Implementar:

* spaced repetition;
* review queue;
* overdue reviews;
* Practice My Mistakes;
* adaptive review.

Resultado:

Sistema passa a decidir o que deve ser revisado.

---

## PHASE 06 — ASSESSMENT ENGINE

Implementar:

* diagnostic;
* checkpoints;
* module tests;
* review tests;
* progress tests;
* level tests;
* progression rules.

Resultado:

Sistema consegue medir evolução e liberar progressão.

---

## PHASE 07 — ADAPTIVE STUDY

Implementar:

* Today's Study;
* study modes;
* recommendation engine;
* weak-topic detection;
* next-best-activity.

Resultado:

O sistema passa a responder:

> "O que eu devo estudar agora?"

---

## PHASE 08 — AI TUTOR

Implementar:

* chat;
* TutorService;
* AIProvider;
* contextual prompt;
* context builder;
* level adaptation;
* exercise generation;
* correction;
* tutor modes;
* interaction tracking.

Resultado:

Aluno consegue conversar com o tutor durante qualquer etapa.

---

## PHASE 09 — AI + LEARNING ENGINE

Integrar:

```text
Tutor
 ↓
Learning Signals
 ↓
Mistake Bank
 ↓
Adaptive Engine
 ↓
Review / Practice
```

Resultado:

Tutor deixa de ser apenas um chat e passa a contribuir para a aprendizagem adaptativa.

---

## PHASE 10 — EXECUTION BOARD

Aprimorar o próprio board:

* progresso por fase;
* dependências;
* bloqueios;
* tarefas;
* métricas;
* roadmap;
* completion percentage;
* timeline;
* project health.

O board deve refletir o estado real da implementação.

---

## PHASE 11 — POLISH & QA

Implementar:

* responsive;
* accessibility;
* error handling;
* loading states;
* empty states;
* UX refinement;
* performance;
* validation;
* automated tests;
* data validation;
* AI failure handling.

---

## PHASE 12 — RELEASE

Preparar:

* README;
* installation;
* environment configuration;
* API configuration;
* deployment instructions;
* backup/import/export;
* production checklist.

---

# 38. DESENVOLVIMENTO POR FASE

NÃO implementar tudo de uma vez.

O desenvolvimento deve seguir:

```text
PHASE
 ↓
DESIGN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
VALIDATE
 ↓
MARK DONE
 ↓
NEXT PHASE
```

Antes de implementar uma fase:

1. listar tarefas;
2. identificar dependências;
3. definir acceptance criteria;
4. atualizar Execution Board;
5. implementar;
6. testar;
7. corrigir;
8. marcar como Done.

---

# 39. VERTICAL SLICE

Antes de tentar preencher todo o currículo, criar um vertical slice completamente funcional:

```text
A1
 └── Module 1
      └── Lesson 1
           ├── Grammar
           ├── Vocabulary
           ├── Exercises
           ├── Reading
           ├── Review
           ├── Checkpoint
           └── Tutor IA
```

Esse slice deve funcionar de ponta a ponta.

Depois disso, expandir o conteúdo.

---

# 40. EXECUTION BOARD COMO FONTE DE VERDADE

O Execution Board deve ser tratado como o estado operacional do projeto.

Sempre que uma implementação ocorrer:

```text
Task Created
     ↓
Ready
     ↓
In Progress
     ↓
Review
     ↓
Done
```

Se houver problema:

```text
In Progress
      ↓
Blocked
```

Registrar motivo do bloqueio.

---

# 41. PROJECT DASHBOARD DO BOARD

Mostrar:

```text
Overall Progress       37%

Phase 00               100%
Phase 01               100%
Phase 02                80%
Phase 03                45%
Phase 04                 0%
...

Tasks
Done                   42
In Progress              5
Blocked                  2
Backlog                 18
```

Também mostrar:

* current phase;
* next task;
* blockers;
* completed tasks;
* phase completion;
* estimated effort;
* project health.

---

# 42. EXECUTION BOARD + IA

Preparar futuramente o board para que um agente IA possa:

* analisar tarefas;
* identificar dependências;
* sugerir próxima tarefa;
* detectar inconsistências;
* gerar subtarefas;
* atualizar documentação;
* validar acceptance criteria.

Essa integração pode ficar para uma etapa futura.

---

# 43. PROJECT STATE

Criar estado persistente do projeto:

```json
{
  "currentPhase": "03",
  "tasksCompleted": 42,
  "tasksTotal": 67,
  "blockedTasks": [],
  "lastUpdated": "...",
  "projectHealth": "healthy"
}
```

---

# 44. IMPORT / EXPORT

Permitir exportar e importar:

### Learning Data

```text
user_progress.json
```

### Project Data

```text
execution_board.json
```

Isso permite backup e continuidade do projeto.

---

# 45. ESTRUTURA DE DIRETÓRIOS

Propor arquitetura semelhante a:

```text
english-journey/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── engines/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── data/
│       ├── curriculum/
│       ├── grammar/
│       ├── vocabulary/
│       ├── exercises/
│       ├── readings/
│       └── assessments/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── providers/
│   └── main.py
│
├── tests/
│
├── docs/
│
├── execution-board/
│
├── README.md
└── .env.example
```

Adaptar a estrutura se houver uma decisão arquitetural melhor, mas preservar separação de responsabilidades.

---

# 46. QUALIDADE DE CÓDIGO

Obrigatório:

* modularidade;
* baixo acoplamento;
* funções pequenas;
* nomes claros;
* comentários apenas quando necessários;
* separação entre dados e lógica;
* tratamento de erros;
* validação de dados;
* nenhuma API key no frontend;
* nenhum HTML gerado diretamente pelo modelo de IA;
* nenhuma dependência desnecessária.

---

# 47. TESTES

Criar testes para:

### Curriculum

* carregamento;
* progressão;
* níveis.

### Exercises

* validação;
* feedback;
* pontuação.

### Review

* cálculo de próxima revisão;
* overdue.

### Mastery

* cálculo;
* atualização.

### Adaptive Engine

* seleção da próxima atividade.

### AI

* payload;
* parsing;
* JSON validation;
* fallback.

### Persistence

* save;
* load;
* export;
* import.

---

# 48. README

O README deve explicar:

* objetivo;
* arquitetura;
* stack;
* instalação;
* execução;
* configuração do AI;
* estrutura do projeto;
* curriculum model;
* adaptive engine;
* Tutor IA;
* Execution Board;
* fases;
* testes;
* troubleshooting;
* roadmap.

---

# 49. CRITÉRIO FINAL DE SUCESSO

A aplicação será considerada funcional quando o usuário conseguir:

```text
Abrir a aplicação
      ↓
Ver seu nível
      ↓
Ver o que precisa estudar
      ↓
Iniciar Today's Study
      ↓
Estudar uma lesson
      ↓
Fazer exercícios
      ↓
Receber explicações
      ↓
Perguntar ao Tutor IA
      ↓
Ser corrigido
      ↓
Registrar erros
      ↓
Revisar posteriormente
      ↓
Fazer checkpoint
      ↓
Atualizar mastery
      ↓
Receber próxima recomendação
      ↓
Acompanhar progresso
```

E, paralelamente, o desenvolvedor deve conseguir:

```text
Abrir Execution Board
      ↓
Ver fase atual
      ↓
Ver tarefas
      ↓
Ver dependências
      ↓
Executar tarefa
      ↓
Mover para Review
      ↓
Validar
      ↓
Marcar Done
      ↓
Avançar para próxima tarefa/fase
```

---

# 50. REGRA FUNDAMENTAL DE IMPLEMENTAÇÃO

Não construir uma aplicação visualmente bonita, porém superficial.

Priorizar nesta ordem:

```text
1. Arquitetura
2. Modelo de dados
3. Learning Engine
4. Progress Engine
5. Review Engine
6. Assessment
7. Adaptive Engine
8. AI Tutor
9. UX
10. Polish
```

Porém, o desenvolvimento deve sempre manter um **vertical slice executável**, evitando construir meses de infraestrutura antes de existir uma experiência real funcionando.

---

# 51. PRIMEIRA EXECUÇÃO DO AGENTE

Ao iniciar o projeto, NÃO comece imediatamente a escrever todo o código.

Primeiro:

### STEP 1

Analise todo este escopo.

### STEP 2

Transforme o escopo em:

```text
EPICS
 → PHASES
   → FEATURES
     → TASKS
```

### STEP 3

Crie o Execution Board inicial.

### STEP 4

Defina dependências.

### STEP 5

Identifique o caminho crítico.

### STEP 6

Defina o primeiro vertical slice.

### STEP 7

Apresente:

```text
Architecture
Project Structure
Implementation Phases
Execution Board
Current Phase
Current Task
Next Tasks
```

### STEP 8

Somente então iniciar a implementação.

---

# 52. COMPORTAMENTO DURANTE O DESENVOLVIMENTO

A cada etapa, o agente deve informar de maneira objetiva:

```text
CURRENT PHASE
CURRENT TASK
STATUS
WHAT WAS IMPLEMENTED
WHAT WAS TESTED
WHAT REMAINS
BLOCKERS
NEXT TASK
```

Atualizar o Execution Board após cada unidade relevante de trabalho.

Não avançar silenciosamente entre fases.

---

# 53. RESULTADO ESPERADO

Entregar uma plataforma que seja simultaneamente:

### Learning Platform

para estudar inglês A1 → B2;

### Adaptive System

para determinar o que estudar;

### AI Tutor

para explicar, corrigir e praticar;

### Progress Tracker

para medir evolução;

### Assessment System

para validar domínio;

### Execution Platform

para acompanhar a própria construção do software através do Execution Board.

O resultado final deve parecer um **produto educacional completo**, e não um conjunto de páginas independentes.

A experiência central deve ser:

> **"Eu abro a aplicação e ela me diz exatamente onde estou, o que preciso aprender, o que preciso revisar, por que estou errando e qual é o próximo passo."**
