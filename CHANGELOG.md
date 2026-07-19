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

### Changed
- Angular, Angular Material/CDK e Angular CLI atualizados de 18.2 para
  22.0.7 (upgrade incremental major a major, com as migrações automáticas
  do próprio `ng update`), corrigindo vulnerabilidades XSS conhecidas do
  Angular <=19.2 (ver `npm audit`).

### Known issues
- `npm audit` ainda aponta vulnerabilidades em dependências de
  desenvolvimento (`webpack-dev-server`/`ws`/`yaml`, usadas só pelo
  dev-server, não vão para o bundle de produção). Corrigi-las exigiria
  `@typescript-eslint` 8.x, que ainda não suporta o TypeScript 6.0 exigido
  pelo Angular 22 — fica para quando o ecossistema `@typescript-eslint`
  alcançar essa versão do TypeScript.

### Removed
- Arquivo residual de conflito de sincronização de nuvem
  (`kanban-board.component.sync-conflict-*.scss`), que não fazia parte do
  código real do componente.

### Fixed
- `.gitignore` agora ignora artefatos `*.sync-conflict-*` para evitar que
  arquivos assim voltem a ser commitados por acidente.

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
