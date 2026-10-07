/**
 * OMPHPanel 文件预览契约
 *
 * 内容大纲：
 * - 文件引用（路径与行区间）
 * - 预览内容体（Markdown / 代码 / 图片 / 缺失 / 不支持）
 * - 宿主提供的加载函数、链接解析函数、布局模式
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：定义 OMPHPanel 与宿主之间的文件预览边界。面板不读取文件系统，只渲染宿主交回的内容。
 *
 * 代码逻辑大纲：
 * 1. 助手回复里的文件链接被解析成 OMPHFileRef。
 * 2. 宿主的 OMPHFilePreviewLoader 按引用读取内容，返回 OMPHFilePreviewData。
 * 3. 面板按 body.kind 选择查看器；读取失败与文件缺失是两种不同的结果。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

export interface OMPHFileRef {
  /** 链接里的路径（相对工作区或绝对路径），已解码，不含 `#L` 锚点。 */
  path: string
  /** 起始行，从 1 开始。 */
  startLine?: number
  /** 结束行，含。缺省时等于起始行。 */
  endLine?: number
}

export type OMPHFileBody =
  | { kind: 'markdown'; text: string }
  | { kind: 'code'; text: string; language?: string }
  | { kind: 'image'; url: string; alt?: string }
  /** 文件不存在。不提供重试，只给说明。 */
  | { kind: 'missing'; message?: string }
  /** 文件存在但本面板无法渲染（PDF、Office、压缩包等）。 */
  | { kind: 'unsupported'; message?: string }

export interface OMPHFilePreviewData {
  body: OMPHFileBody
  /** 字节数，已知时显示在信息条里。 */
  size?: number
  /** 宿主解析出的绝对路径。提供时头部显示它而不是链接里的路径。 */
  absolutePath?: string
}

/**
 * 宿主读取文件。被取消时会收到已中止的 signal，应尽快结束。
 * 抛出异常表示读取失败（可重试）；文件不存在请返回 `{ kind: 'missing' }`。
 */
export type OMPHFilePreviewLoader = (
  ref: OMPHFileRef,
  signal: AbortSignal,
) => Promise<OMPHFilePreviewData>

/** 把链接地址解析成文件引用；不是文件链接时返回 null，面板保持浏览器默认行为。 */
export type OMPHFileLinkResolver = (href: string) => OMPHFileRef | null

/**
 * auto：容器足够宽时并排，否则覆盖整个正文区。
 * split：尽量并排，放不下时仍会退回覆盖。
 * overlay：始终覆盖。
 */
export type OMPHFilePreviewLayout = 'auto' | 'split' | 'overlay'
