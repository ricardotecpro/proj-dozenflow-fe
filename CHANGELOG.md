# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- `README.md` com instruções reais de setup, scripts e deploy.
- `LICENSE` (MIT), `CONTRIBUTING.md` e este `CHANGELOG.md`.
- `environment.ts`/`environment.prod.ts` deixando explícita a configuração
  de API base.
- Headers de segurança (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, CSP básica) no `netlify.toml`.
- Testes unitários para `TaskService`, `ThemeService` e para os principais
  componentes (`TaskCardComponent`, `TaskDialogComponent`,
  `ConfirmationDialogComponent`, `KanbanBoardComponent`).
- Pipeline de CI no GitHub Actions (`.github/workflows/frontend-ci.yml`).
- `.nvmrc` fixando a versão do Node usada pelo projeto.
- Responsividade mobile/tablet: board com scroll horizontal e scroll-snap
  abaixo de 768px, diálogos full-screen em telas pequenas
  (`BreakpointObserver`).
- `NotificationService` (snackbar) para feedback de sucesso/erro em
  criar/editar/excluir tarefas e ao carregar o board; mensagem amigável
  específica para timeout/504 (cold start do backend no Render).
- Indicador de carregamento inicial (`MatProgressSpinnerModule`) enquanto o
  board busca as tarefas.
- Indicador de cor por status no card da tarefa, botão "Adicionar tarefa"
  nos estados vazios de "A Fazer"/"Em Andamento", micro-animação de entrada
  para cards novos.
- `aria-label` nos botões de ícone (adicionar tarefa por coluna, menu de
  ações do card).
- Refino tipográfico: peso 600 (semibold) do Inter carregado (faltava entre
  o 500 e o 700), `-webkit-font-smoothing`/`text-rendering` globais, título
  do header e cabeçalhos de coluna com mais peso/tracking, título do card
  de tarefa em semibold para se destacar da descrição, `<title>` da página
  corrigido de "DozenflowFe" (boilerplate) para "DozenFlow Board".

### Changed
- Angular, Angular Material/CDK e Angular CLI atualizados de 18.2 para
  22.0.7 (upgrade incremental major a major, com as migrações automáticas
  do próprio `ng update`), corrigindo vulnerabilidades XSS conhecidas do
  Angular <=19.2 (ver `npm audit`).
- Migração do theming do Angular Material de M2 (`mat.m2-define-*-theme`,
  obsoleto desde a v17) para Material 3 (`mat.theme()`); CSS de estilos
  globais caiu de ~158 KB para ~24 KB. Paleta azul/violeta mantém a
  identidade visual anterior; dark mode continua via classe `.dark-theme`.
- `loadTasks()` no `KanbanBoardComponent` agora trata erro (antes não tinha
  handler nenhum); erros de criar/editar/excluir, que antes só iam para
  `console.error`, agora também notificam o usuário via snackbar.

### Known issues
- `npm audit` ainda aponta vulnerabilidades em dependências de
  desenvolvimento (`webpack-dev-server`/`ws`/`yaml`, usadas só pelo
  dev-server, não vão para o bundle de produção). Corrigi-las exigiria
  `@typescript-eslint` 8.x, que ainda não suporta o TypeScript 6.0 exigido
  pelo Angular 22 — fica para quando o ecossistema `@typescript-eslint`
  alcançar essa versão do TypeScript.
- Esse mesmo conflito de peer dependency fazia `npm ci` falhar (o `npm
  install` incremental usado durante o desenvolvimento não acusava o
  problema). Contornado com `legacy-peer-deps=true` em `.npmrc`; remover
  quando `@angular-eslint` for atualizado.

### Removed
- Arquivo residual de conflito de sincronização de nuvem
  (`kanban-board.component.sync-conflict-*.scss`), que não fazia parte do
  código real do componente.

### Fixed
- `.gitignore` agora ignora artefatos `*.sync-conflict-*` para evitar que
  arquivos assim voltem a ser commitados por acidente.
- Dark mode não aplicava no build de produção: a extração de CSS crítico do
  Angular (`optimization.styles.inlineCritical`, ligada por padrão) duplicava
  o bloco `:root` de `mat.theme()` inline no `index.html`, e essa cópia
  vencia a classe `.dark-theme` no `<body>`. Corrigido desligando
  `inlineCritical` na configuração de produção do `angular.json`.
  Encontrado testando visualmente o deploy preview do PR no Chrome.
- Botão "Adicionar tarefa" do estado vazio quebrava o texto em duas linhas;
  `white-space: nowrap` no botão.

## [0.1.0] - 2025-09-XX

Baseline reconstruído a partir do histórico do repositório.

### Added
- Quadro Kanban com colunas A Fazer / Em Andamento / Concluída e
  drag-and-drop (Angular CDK) entre colunas, persistindo a nova ordem/status
  no backend.
- CRUD de tarefas via `TaskService` (`TaskCardComponent`,
  `TaskDialogComponent`, `ConfirmationDialogComponent`).
- Alternância de tema claro/escuro (`ThemeService`, `ThemeToggleComponent`).
- Deploy no Netlify com proxy de `/api/*` para o backend no Render.

[Unreleased]: https://github.com/ricardotecpro/proj-dozenflow-fe/compare/main...HEAD
