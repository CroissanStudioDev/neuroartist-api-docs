import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Golos_Text } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

const golosText = Golos_Text({
  variable: '--font-golos-text',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap'
})

export const viewport: Viewport = {
  themeColor: '#6FA31B',
  colorScheme: 'light'
}

export const metadata: Metadata = {
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
      <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
        Neuroartist <span style={{ opacity: 0.55 }}>API Gateway</span>
      </span>
    }
  />
)

const footer = <Footer>{new Date().getFullYear()} © Neuroartist.</Footer>

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${golosText.variable} ${geistMono.variable}`}
      lang="ru"
      dir="ltr"
      suppressHydrationWarning
    >
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          footer={footer}
          darkMode={false}
          nextThemes={{ forcedTheme: 'light', defaultTheme: 'light' }}
          sidebar={{ defaultMenuCollapseLevel: 1, autoCollapse: true, toggleButton: true }}
          toc={{ backToTop: 'Наверх', title: 'Содержание' }}
          search={
            <Search
              placeholder="Поиск по документации…"
              emptyResult="Ничего не найдено."
              loading="Загрузка…"
              errorText="Ошибка поиска."
            />
          }
          editLink={null}
          feedback={{ content: '' }}
          navigation={{ prev: true, next: true }}
          copyPageButton={false}
          lastUpdated={<LastUpdated locale="ru-RU">Обновлено</LastUpdated>}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
