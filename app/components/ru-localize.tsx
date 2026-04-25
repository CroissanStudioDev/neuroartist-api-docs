'use client'

import { useEffect } from 'react'

/**
 * Заменяет хардкоднутые английские строки в Nextra-theme-docs
 * (Copy page dropdown — labels and descriptions) на русские.
 * Эти строки зашиты в node_modules/nextra-theme-docs/dist/components/copy-page.js
 * и не имеют пропсов для локализации.
 */
const TRANSLATIONS: Record<string, string> = {
  'Copy page': 'Скопировать страницу',
  Copied: 'Скопировано',
  'Copy page as Markdown for LLMs': 'Скопировать страницу как Markdown для LLM',
  'Open in ChatGPT': 'Открыть в ChatGPT',
  'Open in Claude': 'Открыть в Claude',
  'Ask questions about this page': 'Задать вопрос по этой странице'
}

function translate(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue?.trim()
    if (text && TRANSLATIONS[text]) {
      node.nodeValue = node.nodeValue!.replace(text, TRANSLATIONS[text])
    }
    return
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach(translate)
  }
}

export function RuLocalize() {
  useEffect(() => {
    translate(document.body)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach(translate)
        if (m.type === 'characterData' && m.target.nodeValue) {
          translate(m.target)
        }
      }
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })
    return () => observer.disconnect()
  }, [])
  return null
}
