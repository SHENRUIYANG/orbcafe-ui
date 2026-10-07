/**
 * OMPHPanel 文件链接与路径工具
 *
 * 内容大纲：
 * - 链接地址解析（含 `#L24`、`#L24-L30`）
 * - 路径拆分、扩展名、语言映射
 * - 字节数格式化
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：把助手回复里的链接变成文件引用，并给预览头部提供展示用的纯函数。
 *
 * 代码逻辑大纲：
 * 1. 带协议头、纯锚点和协议相对地址不是文件链接。
 * 2. 其余地址去掉查询串，解码路径，再识别行区间锚点。
 * 3. 语言表是数据；未知扩展名按纯文本处理。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

import type { OMPHFileLinkResolver } from './omph-file-preview-types'

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i
const LINE_ANCHOR = /^L(\d+)(?:-L?(\d+))?$/i
const BYTES_PER_UNIT = 1024
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const
const FRACTION_BELOW = 10

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** 默认的链接解析：相对路径和以 `/` 开头的路径都是文件。 */
export const parseOmphFileHref: OMPHFileLinkResolver = (href) => {
  const value = href.trim()
  if (!value || value.startsWith('#') || value.startsWith('//') || URL_SCHEME.test(value)) return null

  const hashAt = value.indexOf('#')
  const withoutHash = hashAt >= 0 ? value.slice(0, hashAt) : value
  const hash = hashAt >= 0 ? value.slice(hashAt + 1) : ''
  const queryAt = withoutHash.indexOf('?')
  const path = safeDecode(queryAt >= 0 ? withoutHash.slice(0, queryAt) : withoutHash)
  if (!path || path.endsWith('/')) return null

  const anchor = LINE_ANCHOR.exec(hash)
  if (!anchor) return { path }
  const startLine = Number(anchor[1])
  if (startLine < 1) return { path }
  const endLine = anchor[2] ? Number(anchor[2]) : startLine
  return { path, startLine, endLine: Math.max(startLine, endLine) }
}

export const baseName = (path: string) => path.split('/').filter(Boolean).pop() ?? path

export const dirName = (path: string) => {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

export const extensionOf = (path: string) => {
  const name = baseName(path)
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

interface LanguageInfo {
  /** react-syntax-highlighter 使用的语言标识。 */
  prism: string
  /** 信息条里显示的名称。 */
  label: string
}

const PLAIN_TEXT: LanguageInfo = { prism: 'text', label: 'Text' }

const LANGUAGE_BY_EXTENSION: Record<string, LanguageInfo> = {
  ts: { prism: 'typescript', label: 'TypeScript' },
  tsx: { prism: 'tsx', label: 'TSX' },
  js: { prism: 'javascript', label: 'JavaScript' },
  mjs: { prism: 'javascript', label: 'JavaScript' },
  cjs: { prism: 'javascript', label: 'JavaScript' },
  jsx: { prism: 'jsx', label: 'JSX' },
  json: { prism: 'json', label: 'JSON' },
  py: { prism: 'python', label: 'Python' },
  java: { prism: 'java', label: 'Java' },
  go: { prism: 'go', label: 'Go' },
  rs: { prism: 'rust', label: 'Rust' },
  c: { prism: 'c', label: 'C' },
  h: { prism: 'c', label: 'C' },
  cpp: { prism: 'cpp', label: 'C++' },
  cs: { prism: 'csharp', label: 'C#' },
  sql: { prism: 'sql', label: 'SQL' },
  sh: { prism: 'bash', label: 'Shell' },
  bash: { prism: 'bash', label: 'Shell' },
  yml: { prism: 'yaml', label: 'YAML' },
  yaml: { prism: 'yaml', label: 'YAML' },
  xml: { prism: 'markup', label: 'XML' },
  html: { prism: 'markup', label: 'HTML' },
  css: { prism: 'css', label: 'CSS' },
  scss: { prism: 'scss', label: 'SCSS' },
  abap: { prism: 'abap', label: 'ABAP' },
  toml: { prism: 'toml', label: 'TOML' },
  ini: { prism: 'ini', label: 'INI' },
  md: { prism: 'markdown', label: 'Markdown' },
  csv: { prism: 'text', label: 'CSV' },
  log: { prism: 'text', label: 'Log' },
  txt: PLAIN_TEXT,
}

/** 显式语言优先，其次按扩展名，最后按纯文本。 */
export const describeLanguage = (path: string, explicit?: string): LanguageInfo => {
  if (explicit) {
    const known = Object.values(LANGUAGE_BY_EXTENSION).find((info) => info.prism === explicit)
    return known ?? { prism: explicit, label: explicit }
  }
  return LANGUAGE_BY_EXTENSION[extensionOf(path)] ?? PLAIN_TEXT
}

export const formatBytes = (bytes: number) => {
  let value = bytes
  let unit = 0
  while (value >= BYTES_PER_UNIT && unit < SIZE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT
    unit += 1
  }
  const text = unit > 0 && value < FRACTION_BELOW ? value.toFixed(1) : Math.round(value).toString()
  return `${text} ${SIZE_UNITS[unit]}`
}
