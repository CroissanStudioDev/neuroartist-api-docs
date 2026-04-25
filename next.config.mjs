import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: {
    codeblocks: true
  }
})

export default withNextra({
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.tsx'
    }
  }
})
