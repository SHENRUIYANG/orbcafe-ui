/**
 * 回复中的 HTML 演示
 *
 * 内容大纲：
 * - 把闭合的 html 代码块放进沙箱 iframe
 * - 页面自己上报高度，父页面只接受这个 iframe 的消息
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-07
 *
 * 作用：让助手回复里的单文件 HTML 直接可交互，同时不把脚本放进宿主页面。
 *
 * 代码逻辑大纲：
 * 1. 完整文档注入高度探测；片段则包一层最小文档。
 * 2. sandbox 只开脚本，不开同源，不能读宿主页面。
 * 3. 高度限制在最小和最大之间，避免演示把对话撑开。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-07 初始版本。
 */

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const MESSAGE_SOURCE = 'orb-html-demo'
const MIN_HEIGHT_PX = 160
const MAX_HEIGHT_PX = 560
const DEFAULT_HEIGHT_PX = 220

const HEIGHT_PROBE = `<script>(function(){var post=function(){var height=Math.ceil(document.documentElement.scrollHeight);parent.postMessage({source:${JSON.stringify(MESSAGE_SOURCE)},height:height},'*')};addEventListener('load',post);addEventListener('resize',post);new MutationObserver(post).observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});post()})()</script>`

const FRAME_STYLE = 'html,body{margin:0;padding:12px;font:14px/1.5 system-ui,sans-serif;}'

const isHtmlDocument = (source: string) => /<html[\s>]/i.test(source)

/** 完整文档在 body 结束前插入探测；片段包成可独立打开的文档。 */
export const prepareHtmlDemoDocument = (source: string) => {
  const trimmed = source.trim()
  if (!isHtmlDocument(trimmed)) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${FRAME_STYLE}</style></head><body>${trimmed}${HEIGHT_PROBE}</body></html>`
  }
  if (/<\/body>/i.test(trimmed)) return trimmed.replace(/<\/body>/i, `${HEIGHT_PROBE}</body>`)
  return `${trimmed}${HEIGHT_PROBE}`
}

export const HtmlDemo = ({ content, title = 'Interactive HTML' }: { content: string; title?: string }) => {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [height, setHeight] = useState(DEFAULT_HEIGHT_PX)
  const srcDoc = useMemo(() => prepareHtmlDemoDocument(content), [content])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      const data = event.data as { source?: string; height?: number } | null
      if (!data || data.source !== MESSAGE_SOURCE || typeof data.height !== 'number' || !Number.isFinite(data.height)) return
      setHeight(Math.min(MAX_HEIGHT_PX, Math.max(MIN_HEIGHT_PX, Math.ceil(data.height))))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <figure className="orb-html-demo-frame">
      <figcaption className="orb-html-demo-caption">{title}</figcaption>
      <iframe
        ref={frameRef}
        className="orb-html-demo"
        title={title}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        style={{ height }}
      />
    </figure>
  )
}

export default HtmlDemo
