import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Golos_Text } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'
import { LogoMark } from './components/logo'

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'light dark'
}

export const metadata: Metadata = {
  title: {
    default: 'Документация — НейроХудожник API',
    template: '%s — НейроХудожник API Docs'
  },
  description:
    'REST API для генерации изображений, видео и аудио. FLUX, Kling, ElevenLabs и ещё 1300+ моделей. Оплата в рублях, без VPN.'
}

const navbar = (
  <Navbar
    logo={
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <LogoMark size={26} />
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
          НейроХудожник <span style={{ opacity: 0.55 }}>API Docs</span>
        </span>
      </span>
    }
  >
    <a
      href="https://gateway.neuroartist.ru"
      target="_blank"
      rel="noreferrer"
      style={{ fontSize: '0.9375rem', fontWeight: 500, padding: '0.375rem 0.625rem' }}
    >
      Дашборд ↗
    </a>
  </Navbar>
)

const footer = (
  <Footer>
    <span style={{ opacity: 0.6 }}>{new Date().getFullYear()} © НейроХудожник.</span>
  </Footer>
)

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
          nextThemes={{ defaultTheme: 'system' }}
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
