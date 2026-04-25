import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'Neuroartist API Gateway — Документация',
    template: '%s — Neuroartist API Gateway'
  },
  description:
    'Один HTTPS-эндпоинт к генеративным моделям с кредитным биллингом и SSE-прогрессом. API-ключ, async-очередь, webhooks, OpenAPI 3.1.'
}

const navbar = (
  <Navbar
    logo={
      <span className="font-semibold">
        Neuroartist <span className="opacity-60">API Gateway</span>
      </span>
    }
    projectLink="https://github.com/neuroartist/neuroartist-api-gateway"
  />
)

const footer = <Footer>{new Date().getFullYear()} © Neuroartist.</Footer>

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/neuroartist/docs/tree/main"
          footer={footer}
          sidebar={{ defaultMenuCollapseLevel: 1, autoCollapse: true, toggleButton: true }}
          toc={{ backToTop: 'Наверх' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
