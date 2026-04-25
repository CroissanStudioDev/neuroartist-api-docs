/**
 * MCP-сервер для документации НейроХудожник API.
 *
 * Подключается клиентами Claude Desktop, Cursor, VS Code (через
 * mcp-remote) и любыми другими, поддерживающими streamable-HTTP
 * транспорт MCP.
 *
 * Endpoints:
 *   GET  /mcp/sse    — SSE-стрим для legacy stdio-bridges
 *   POST /mcp/mcp    — основной streamable-HTTP transport
 *
 * Tools:
 *   list_docs           — каталог страниц с описаниями
 *   get_doc(path)       — markdown целой страницы
 *   search_docs(query)  — substring-поиск по всем страницам
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

interface DocEntry {
  /** Route path, e.g. "/api/run" or "/" for index. */
  route: string
  /** Path on disk relative to content/. */
  file: string
  /** Frontmatter title. */
  title: string
  /** Frontmatter description. */
  description: string
}

let cache: DocEntry[] | null = null

async function listAllDocs(): Promise<DocEntry[]> {
  if (cache) return cache
  const out: DocEntry[] = []
  await walk(CONTENT_ROOT, '')
  cache = out
  return out

  async function walk(dir: string, prefix: string) {
    const entries = await readdir(dir)
    for (const entry of entries.sort()) {
      if (entry.startsWith('_')) continue
      const full = path.join(dir, entry)
      const rel = prefix ? `${prefix}/${entry}` : entry
      const s = await stat(full)
      if (s.isDirectory()) {
        await walk(full, rel)
      } else if (entry.endsWith('.mdx')) {
        const body = await readFile(full, 'utf8')
        const fm = parseFrontmatter(body)
        let route = '/' + rel.replace(/\.mdx$/, '').replace(/\/index$/, '')
        if (route === '/index') route = '/'
        out.push({
          route,
          file: rel,
          title: fm.title ?? prettyName(rel),
          description: fm.description ?? ''
        })
      }
    }
  }
}

function parseFrontmatter(mdx: string): { title?: string; description?: string } {
  if (!mdx.startsWith('---')) return {}
  const end = mdx.indexOf('\n---', 3)
  if (end === -1) return {}
  const block = mdx.slice(3, end)
  const out: Record<string, string> = {}
  for (const line of block.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

function prettyName(rel: string): string {
  return rel
    .replace(/\.mdx$/, '')
    .replace(/\/index$/, '')
    .split('/')
    .pop()!
    .replace(/[-_]/g, ' ')
}

function stripFrontmatter(mdx: string): string {
  if (!mdx.startsWith('---')) return mdx
  const end = mdx.indexOf('\n---', 3)
  return end === -1 ? mdx : mdx.slice(end + 4).trimStart()
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'list_docs',
      {
        title: 'Список страниц документации',
        description:
          'Вернёт все доступные страницы НейроХудожник API Docs с заголовками и описаниями.',
        inputSchema: {}
      },
      async () => {
        const docs = await listAllDocs()
        const lines = docs.map(
          (d) => `- ${d.route}  —  ${d.title}${d.description ? `: ${d.description}` : ''}`
        )
        return {
          content: [
            { type: 'text', text: `# Документация\n\n${lines.join('\n')}` }
          ]
        }
      }
    )

    server.registerTool(
      'get_doc',
      {
        title: 'Получить страницу документации',
        description:
          'Возвращает полный markdown страницы. Передайте route, например "/quickstart", "/api/run", "/billing".',
        inputSchema: {
          path: z
            .string()
            .describe('Route страницы, например /quickstart или /api/run')
        }
      },
      async ({ path: route }) => {
        const docs = await listAllDocs()
        const normalized = route === '' ? '/' : route.startsWith('/') ? route : `/${route}`
        const doc = docs.find((d) => d.route === normalized)
        if (!doc) {
          return {
            content: [
              {
                type: 'text',
                text: `Не найдено: ${normalized}. Используйте list_docs для списка доступных страниц.`
              }
            ],
            isError: true
          }
        }
        const body = await readFile(path.join(CONTENT_ROOT, doc.file), 'utf8')
        return {
          content: [
            {
              type: 'text',
              text: `# ${doc.title}\n\n_Источник: https://docs.neuroartist.ru${doc.route}_\n\n${stripFrontmatter(body)}`
            }
          ]
        }
      }
    )

    server.registerTool(
      'search_docs',
      {
        title: 'Поиск по документации',
        description:
          'Ищет подстроку (case-insensitive) во всех страницах. Возвращает совпадающие страницы с превью.',
        inputSchema: {
          query: z.string().min(2).describe('Поисковая строка'),
          limit: z
            .number()
            .int()
            .min(1)
            .max(20)
            .default(5)
            .describe('Сколько результатов вернуть')
        }
      },
      async ({ query, limit }) => {
        const docs = await listAllDocs()
        const needle = query.toLowerCase()
        const hits: { route: string; title: string; preview: string }[] = []

        for (const doc of docs) {
          const body = await readFile(path.join(CONTENT_ROOT, doc.file), 'utf8')
          const text = stripFrontmatter(body).toLowerCase()
          const idx = text.indexOf(needle)
          if (idx === -1) continue
          const start = Math.max(0, idx - 80)
          const end = Math.min(text.length, idx + needle.length + 120)
          hits.push({
            route: doc.route,
            title: doc.title,
            preview: '…' + body.slice(start, end).trim() + '…'
          })
          if (hits.length >= limit) break
        }

        if (hits.length === 0) {
          return {
            content: [
              { type: 'text', text: `Ничего не найдено по запросу: "${query}"` }
            ]
          }
        }

        const text =
          `# Найдено ${hits.length} страниц по "${query}"\n\n` +
          hits
            .map((h) => `## ${h.title}\nhttps://docs.neuroartist.ru${h.route}\n\n${h.preview}`)
            .join('\n\n---\n\n')

        return { content: [{ type: 'text', text }] }
      }
    )
  },
  {
    serverInfo: {
      name: 'neuroartist-api-docs',
      version: '0.1.0'
    },
    capabilities: {
      tools: {}
    }
  },
  {
    basePath: '/mcp',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development'
  }
)

export { handler as GET, handler as POST, handler as DELETE }
