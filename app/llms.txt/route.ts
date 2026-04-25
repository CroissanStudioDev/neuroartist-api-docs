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
  ['Синхронные запросы /run', 'build/sync.mdx'],
  ['Асинхронная очередь и SSE', 'build/async.mdx'],
  ['Webhooks', 'build/webhooks.mdx'],
  ['Биллинг', 'billing/index.mdx'],
  ['Коды ошибок', 'errors.mdx']
] as const

export async function GET() {
  const root = path.join(process.cwd(), 'content')
  const sections = await Promise.all(
    PAGES.map(async ([title, file]) => {
      const body = await readFile(path.join(root, file), 'utf8')
      return `## ${title}\n\n${stripFrontmatter(body)}`
    })
  )

  const body = [
    '# НейроХудожник API',
    '',
    'Назначение: один HTTPS API для image / video / audio generation с кредитным биллингом, async-очередью, SSE-прогрессом, webhooks и S3-хранением результатов.',
    '',
    '## Быстрые факты для AI-агента',
    '',
    '- Базовый URL: https://api.neuroartist.ru',
    '- Полная документация: https://docs.neuroartist.ru',
    '- OpenAPI: https://api.neuroartist.ru/openapi.json',
    '- llms-full.txt (вся документация): https://docs.neuroartist.ru/llms-full.txt',
    '- Аутентификация: `Authorization: Bearer na_live_...` или `x-api-key: na_live_...`; session-only ручки требуют cookie.',
    '- Первый image request: `POST /run/flux/dev` с JSON `{ "prompt": "...", "image_size": "portrait_4_3" }`.',
    '- Async: `POST /queue/{modelId}` → `requestId`; затем `GET /queue/{modelId}/requests/{requestId}/progress/stream`.',
    '- Webhook: добавьте `?webhook=https://your.app/cb`; проверяйте `webhook-id`, `webhook-timestamp`, `webhook-signature`.',
    '- Ошибки: стабильный машинный код в поле `error`, например `insufficient_balance`, `rate_limited`, `provider_error`.',
    '',
    ...sections
  ].join('\n')

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
