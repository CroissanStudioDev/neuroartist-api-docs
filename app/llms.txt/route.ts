import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-static'

const PAGES = [
  ['Введение', 'index.mdx'],
  ['Quickstart', 'quickstart.mdx'],
  ['Cheatsheet', 'cheatsheet.mdx']
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
    '# Neuroartist API Gateway',
    '',
    'Один HTTPS-эндпоинт к генеративным моделям (image / video / audio).',
    'API-ключ, кредитный биллинг, SSE-прогресс, S3-хранение результатов.',
    '',
    '- Production: https://api.neuroartist.ru',
    '- Полная документация: https://docs.neuroartist.ru',
    '- OpenAPI: https://api.neuroartist.ru/openapi.json',
    '- llms-full.txt (вся документация): https://docs.neuroartist.ru/llms-full.txt',
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
    .replace(/<Cards[\s\S]*?<\/Cards>/g, '')
    .replace(/<Tabs[\s\S]*?<\/Tabs>/g, (m) => m.replace(/<\/?Tabs[^>]*>|<\/?Tabs\.Tab[^>]*>/g, ''))
    .replace(/<Steps>([\s\S]*?)<\/Steps>/g, '$1')
    .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, '> $1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
