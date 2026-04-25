import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-static'

const PAGES = [
  ['Введение', 'index.mdx'],
  ['Быстрый старт', 'quickstart.mdx'],
  ['Аутентификация', 'authentication.mdx'],
  ['Изображения', 'generate/images.mdx'],
  ['Видео', 'generate/video.mdx'],
  ['Аудио', 'generate/audio.mdx'],
  ['Каталог моделей', 'generate/models.mdx'],
  ['Синхронные запросы /run', 'build/sync.mdx'],
  ['Асинхронная очередь /queue', 'build/async.mdx'],
  ['Webhooks', 'build/webhooks.mdx'],
  ['Загрузка файлов', 'build/upload-inputs.mdx'],
  ['Биллинг', 'billing/index.mdx'],
  ['Авто-пополнение', 'billing/auto-topup.mdx'],
  ['API: обзор', 'api/index.mdx'],
  ['API: /api/auth', 'api/authentication.mdx'],
  ['API: /run', 'api/run.mdx'],
  ['API: /queue', 'api/queue.mdx'],
  ['API: /me', 'api/me.mdx'],
  ['API: /billing', 'api/billing.mdx'],
  ['API: /webhooks', 'api/webhooks.mdx'],
  ['API: /v1', 'api/v1.mdx'],
  ['API: health и метрики', 'api/health.mdx'],
  ['API: коды ошибок', 'api/errors.mdx'],
  ['API: лимиты запросов', 'api/rate-limits.mdx'],
  ['API: хранение результатов', 'api/asset-hosting.mdx']
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
