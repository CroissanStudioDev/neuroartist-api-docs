import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'Neuroartist API Gateway — Документация',
    template: '%s — Neuroartist API Gateway'
  },
  description:
    'Документация публичного developer-API gateway Neuroartist: модели, биллинг, аутентификация, SSE.'
}

const banner = (
  <Banner storageKey="na-gateway-docs-launch">
    Документация Neuroartist API Gateway
  </Banner>
)

const navbar = (
  <Navbar
    logo={<b>Neuroartist API Gateway</b>}
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
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/neuroartist/docs/tree/main"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
