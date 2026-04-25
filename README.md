# НейроХудожник API Docs

Публичная документация для [НейроХудожник API](https://api.neuroartist.ru) — REST API для генерации изображений, видео и аудио (1300+ моделей).

Сайт: **https://docs.neuroartist.ru** (см. [`/`](https://docs.neuroartist.ru/), [`/quickstart`](https://docs.neuroartist.ru/quickstart), [`/api`](https://docs.neuroartist.ru/api)).

## Стек

- **[Nextra](https://nextra.site) 4.6** + **Next.js 16** (App Router, Turbopack, React 19)
- Шрифты: **Golos Text** + **Geist Mono** через `next/font/google`
- Поиск: **Pagefind** 1.5 (статический индекс, генерируется в `postbuild`)
- Тема: light / dark с переключателем
- AI-агентам: встроенный **MCP-сервер** (`/mcp/mcp`) на `mcp-handler` от Vercel + статические `/llms.txt` и `/llms-full.txt`

## Локальный запуск

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

Требования: **Node ≥ 22** и **pnpm ≥ 10**.

## Скрипты

| Команда | Что делает |
| --- | --- |
| `pnpm dev` | Турбопак-dev на :3000 |
| `pnpm build` | Production build + автогенерация Pagefind-индекса |
| `pnpm start` | Запустить собранный сайт |
| `pnpm typecheck` | `tsc --noEmit` |

## Структура

```
docs/
├── app/
│   ├── layout.tsx                ← Layout: navbar, search, theme switcher
│   ├── globals.css               ← Brand-tokens (lime #6FA31B), фонты, тонкие overrides
│   ├── icon.svg                  ← favicon
│   ├── components/
│   │   ├── logo.tsx              ← инлайн SVG-логотип
│   │   └── ru-localize.tsx       ← рантайм-перевод хардкоднутых строк Nextra
│   ├── [[...mdxPath]]/           ← catch-all для MDX-страниц
│   ├── llms.txt/                 ← /llms.txt — компактный конспект
│   ├── llms-full.txt/            ← /llms-full.txt — все страницы одним файлом
│   ├── mcp/[transport]/          ← /mcp/mcp — MCP-сервер для Claude/Cursor/VS Code
│   ├── robots.ts                 ← /robots.txt
│   └── sitemap.ts                ← /sitemap.xml
├── content/                      ← MDX-страницы (источник правды)
│   ├── _meta.ts                  ← структура корневого sidebar (separator-секции)
│   ├── index.mdx                 ← Введение (главная)
│   ├── quickstart.mdx
│   ├── authentication.mdx
│   ├── mcp.mdx                   ← инструкция как подключить MCP-сервер
│   ├── errors.mdx
│   ├── rate-limits.mdx
│   ├── cli.mdx                   ← CLI `na`
│   ├── skill.mdx                 ← Agent Skill `neuroartist-media`
│   ├── generate/                 ← Каталог моделей: обзор, поиск, схема + image/video/audio
│   ├── build/                    ← Генерация: sync, async + SSE, webhooks, файлы
│   ├── billing/                  ← Биллинг и авто-пополнение
│   └── api/                      ← API Reference: /run, /queue, /me, /billing, /webhooks
├── public/_pagefind/             ← search index (генерируется в postbuild, в .gitignore)
├── mdx-components.tsx            ← компоненты MDX темы
└── next.config.mjs               ← Nextra-конфиг (Pagefind code-search, defaultShowCopyCode)
```

## Добавить страницу

1. Создать `content/<slug>.mdx` (или `content/<group>/<slug>.mdx` для вложенности):

   ```mdx
   ---
   title: Заголовок
   description: Короткое описание для meta-тэга
   ---

   # Заголовок

   Контент в MDX.
   ```

2. Прописать заголовок в соседнем `_meta.ts`:

   ```ts
   export default {
     // …existing,
     'new-page': 'Новая страница'
   }
   ```

3. Hot-reload подхватит автоматически. Для production пересобрать поиск — `pnpm build`.

## Соглашения

- **Бренд:** «**НейроХудожник API**», не «Neuroartist API Gateway». Для пользователя — это единый сервис; не упоминать upstream-провайдеров (fal.ai и т.п.) в прозе.
- **Терминология:** «баланс в рублях», не «кредиты». Поля API (`creditCost`, `creditsToGrant`) в JSON-примерах оставлять — это actual field names.
- **Аутентификация:** только `Authorization: Bearer na_live_…`. Никаких упоминаний session-cookie / Better Auth — это внутренний механизм дашборда.
- **modelId:** без префикса `fal-ai/` — `flux/dev`, не `fal-ai/flux/dev`.
- **Никаких ASCII-схем** в прозе. Только списки и таблицы.
- **Не более одной кнопки в navbar** (сейчас — «Дашборд ↗»).

## AI-friendly выходы

| Endpoint | Назначение |
| --- | --- |
| `/llms.txt` | Компактный markdown-конспект (~10 KB) |
| `/llms-full.txt` | Вся документация одним файлом (~120 KB) |
| `/mcp/mcp` | MCP Streamable-HTTP — `list_docs`, `get_doc`, `search_docs` |
| `/sitemap.xml`, `/robots.txt` | SEO |

См. [`/mcp`](https://docs.neuroartist.ru/mcp) — инструкции для Claude Desktop, Cursor, VS Code, Claude Code CLI.

## Деплой

Любая Next.js-совместимая платформа: Vercel, Cloudflare Pages, Render, Docker. После `pnpm build`:

- `.next/` — собранный сайт.
- `public/_pagefind/` — search-index (создаётся в `postbuild`, должен попасть в финальный билд).

## Лицензия

MIT. Контент в `content/` — собственность НейроХудожник.
