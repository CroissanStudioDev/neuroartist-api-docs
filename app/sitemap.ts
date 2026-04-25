import type { MetadataRoute } from 'next'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SITE = 'https://docs.neuroartist.ru'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = path.join(process.cwd(), 'content')
  const files = await collectMdx(root)
  const now = new Date()

  return files.map((rel) => {
    const route = '/' + rel.replace(/\.mdx$/, '').replace(/\/index$/, '')
    return {
      url: `${SITE}${route === '/' ? '' : route}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: route === '/' ? 1 : 0.7
    }
  })
}
