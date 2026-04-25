import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-static'

export async function GET() {
  const root = path.join(process.cwd(), 'content')
  const files = await collectMdx(root)

  const sections = await Promise.all(
    files.map(async (rel) => {
      const body = await readFile(path.join(root, rel), 'utf8')
      const route = '/' + rel.replace(/\.mdx$/, '').replace(/\/index$/, '').replace(/\\/g, '/')
      return `<!-- ${route || '/'} -->\n\n${stripFrontmatter(body)}`
    })
  )

  const body = [
    '# Neuroartist API Gateway — полная документация',
    '',
    'Один HTTPS-эндпоинт к генеративным моделям (image / video / audio).',
    'API-ключ, кредитный биллинг, SSE-прогресс, S3-хранение результатов.',
    '',
    '- Production: https://api.neuroartist.ru',
    '- OpenAPI: https://api.neuroartist.ru/openapi.json',
    '',
    '---',
    '',
    ...sections
  ].join('\n\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}

async function collectMdx(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir)
  const out: string[] = []
  for (const entry of entries.sort()) {
    if (entry.startsWith('_')) continue
    const full = path.join(dir, entry)
    const rel = prefix ? `${prefix}/${entry}` : entry
    const s = await stat(full)
    if (s.isDirectory()) {
      out.push(...(await collectMdx(full, rel)))
    } else if (entry.endsWith('.mdx')) {
      out.push(rel)
    }
  }
  return out
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
