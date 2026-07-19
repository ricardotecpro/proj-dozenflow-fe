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
- Dependências (Angular, Angular Material/CDK, CLI) atualizadas para as
  versões estáveis mais recentes compatíveis.

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
