import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-static'

const PAGES = [
  ['Введение', 'index.mdx'],
  ['Быстрый старт', 'get-started/quickstart.mdx'],
  ['Аутентификация', 'get-started/authentication.mdx'],
  ['Изображения', 'generate/images.mdx'],
  ['Видео', 'generate/video.mdx'],
  ['Аудио', 'generate/audio.mdx'],
  ['Каталог моделей', 'generate/models.mdx'],
  ['Синхронный запрос', 'build/sync.mdx'],
  ['Асинхронная очередь и SSE', 'build/async.mdx'],
  ['Приём webhook', 'build/webhooks.mdx'],
  ['Загрузка входных файлов', 'build/upload-inputs.mdx'],
  ['Биллинг', 'manage/billing.mdx'],
  ['Авто-пополнение', 'manage/auto-topup.mdx'],
  ['Шпаргалка по API', 'reference/cheatsheet.mdx'],
  ['Коды ошибок', 'reference/errors.mdx'],
  ['Лимиты запросов', 'reference/rate-limits.mdx'],
  ['Формат SSE-стрима', 'reference/sse.mdx'],
  ['Формат webhooks', 'reference/webhooks.mdx'],
  ['Хранение результатов', 'reference/asset-hosting.mdx'],
  ['API: обзор', 'reference/api/index.mdx'],
  ['API: /api/auth', 'reference/api/authentication.mdx'],
  ['API: /v1', 'reference/api/v1.mdx'],
  ['API: /run', 'reference/api/run.mdx'],
  ['API: /queue', 'reference/api/queue.mdx'],
  ['API: /me', 'reference/api/me.mdx'],
  ['API: /billing', 'reference/api/billing.mdx'],
  ['API: /webhooks', 'reference/api/webhooks.mdx'],
  ['API: health и метрики', 'reference/api/health.mdx']
] as const

export async function GET() {
  const root = path.join(process.cwd(), 'content')

  const sections = await Promise.all(
    PAGES.map(async ([title, rel]) => {
      const body = await readFile(path.join(root, rel), 'utf8')
      const route = '/' + rel.replace(/\.mdx$/, '').replace(/\/index$/, '').replace(/\\/g, '/')
      return `<!-- ${route || '/'} -->\n\n## ${title}\n\n${stripFrontmatter(body)}`
    })
  )

  const body = [
    '# Neuroartist API — полная документация',
    '',
    'Один HTTPS-эндпоинт к генеративным моделям (image / video / audio).',
    'API-ключ, кредитный биллинг, SSE-прогресс, S3-хранение результатов.',
    '',
    '- Базовый URL: https://api.neuroartist.ru',
    '- OpenAPI: https://api.neuroartist.ru/openapi.json',
    '- Аутентификация: `Authorization: Bearer na_live_...` или `x-api-key: na_live_...`; session-only ручки требуют cookie.',
    '- Ошибки: стабильный машинный код в поле `error`; дополнительные поля зависят от ошибки.',
    '- Основные задачи: image generation → `/generate/images` и `/build/sync`; webhooks → `/build/webhooks`; top-up → `/manage/billing` и `/manage/auto-topup`.',
    '',
    '---',
    '',
    ...sections
  ].join('\n\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}

function stripFrontmatter(mdx: string): string {
  if (mdx.startsWith('---')) {
    const end = mdx.indexOf('\n---', 3)
    if (end !== -1) mdx = mdx.slice(end + 4).trimStart()
  }
  return stripMdx(mdx)
}

function stripMdx(s: string): string {
  return s
    .split('\n')
    .filter((line) => !/^import\s+.+from\s+['"]/.test(line.trim()))
    .join('\n')
    .replace(/<Cards[^>]*>/g, '')
    .replace(/<\/Cards>/g, '')
    .replace(/<Cards\.Card[^>]*title="([^"]+)"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/Cards\.Card>/g, '- [$1]($2): $3')
    .replace(/<Tabs[\s\S]*?<\/Tabs>/g, (m) => m.replace(/<\/?Tabs[^>]*>|<\/?Tabs\.Tab[^>]*>/g, ''))
    .replace(/<Steps>([\s\S]*?)<\/Steps>/g, '$1')
    .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, '> $1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
