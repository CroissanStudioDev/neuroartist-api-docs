# neuroartist-api-gateway-docs

Документационный сайт Neuroartist API Gateway — Nextra 4 + Next.js 16 + React 19, App Router, MDX-контент в `content/`.

## Локальная разработка

```bash
pnpm install
pnpm dev
```

Откроется на `http://localhost:3000`.

## Структура

| Путь | Назначение |
|------|------------|
| `app/layout.tsx` | Root layout с `Layout` из `nextra-theme-docs` (navbar, footer, banner) |
| `app/[[...mdxPath]]/page.tsx` | Catch-all роут — компилит и отдаёт MDX из `content/` |
| `mdx-components.tsx` | MDX-компоненты темы (используется через turbopack alias `next-mdx-import-source-file`) |
| `content/*.mdx` | Документация в Markdown/MDX |
| `content/_meta.ts` | Сайдбар-структура и заголовки |
| `next.config.mjs` | Конфиг Nextra-плагина (search, copy code) |

## Команды

```bash
pnpm dev          # локальный сервер с Turbopack
pnpm build        # production build
pnpm start        # serve production build
pnpm typecheck    # tsc --noEmit
```

## Добавить страницу

1. Создать `content/<slug>.mdx` (или `content/<group>/<slug>.mdx` для вложенности).
2. Прописать заголовок в соседнем `_meta.ts`.
3. Перезапускать dev-сервер не нужно — горячая перезагрузка ловит новые файлы.
