# DozenFlow — Frontend

Interface web do [DozenFlow](https://dozenflow.netlify.app), um quadro Kanban
para gerenciamento de tarefas, com drag-and-drop entre colunas. Este
repositório contém apenas o frontend; a API vive em
[`proj-dozenflow-be`](https://github.com/ricardotecpro/proj-dozenflow-be).

## Stack

- Angular (standalone components)
- Angular Material + Angular CDK (drag-and-drop)
- TypeScript, SCSS
- ESLint + Prettier + Husky/lint-staged

## Pré-requisitos

- Node.js (versão fixada em [`.nvmrc`](.nvmrc) — use `nvm use` se disponível)
- npm

## Como rodar (desenvolvimento)

```bash
npm install
npm start        # ng serve, http://localhost:4200
```

Em desenvolvimento, chamadas para `/api/*` são redirecionadas para o backend
local via `proxy.conf.json`. Rode o [backend](https://github.com/ricardotecpro/proj-dozenflow-be)
em `http://localhost:8080` em paralelo.

## Scripts

| Comando | Descrição |
|---|---|
| `npm start` | servidor de desenvolvimento (`ng serve`) |
| `npm run build` | build de desenvolvimento |
| `npm run build:prod` | build de produção (`dist/dozenflow-fe/browser`) |
| `npm test` | testes unitários (Karma/Jasmine) |
| `npm run lint` | lint (ESLint) |
| `npm run format` | formata o código (Prettier) |

## Deploy

Publicado no Netlify a partir deste repositório (`netlify.toml`): build de
produção e redirect de `/api/*` para a API no Render. Qualquer push na
branch de deploy configurada no Netlify dispara um novo build.

## Documentação adicional

- [`TUTORIAL-FRONTEND.md`](TUTORIAL-FRONTEND.md) — tutorial de construção da UI passo a passo.
- [`CHANGELOG.md`](CHANGELOG.md) — histórico de mudanças.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — convenções de contribuição.

## Licença

Distribuído sob a licença MIT — veja [`LICENSE`](LICENSE).
