# Contribuindo

## Branches

- `main` — código estável, implantável (Netlify builda a partir daqui).
- `feature/<nome>` — novas funcionalidades.
- `fix/<nome>` — correções de bug.
- `chore/<nome>` — manutenção, dependências, infraestrutura, documentação.

Abra Pull Requests contra `main`.

## Commits

Use mensagens no formato [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
<tipo>(<escopo opcional>): <descrição curta>
```

Tipos comuns: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.

## Rodando localmente

```bash
npm install
npm start                 # ng serve
npm run lint               # ESLint
npm test                    # Karma/Jasmine
npm run build:prod          # build de produção
```

O pre-commit hook (Husky + lint-staged) já roda lint/format nos arquivos
staged automaticamente.

## Antes de abrir um PR

- [ ] `npm run lint` e `npm test` passam localmente.
- [ ] Novos componentes/serviços com lógica não trivial têm teste
      correspondente.
- [ ] `CHANGELOG.md` atualizado na seção `[Unreleased]`.
- [ ] Nenhum segredo ou URL de ambiente real foi commitado.
