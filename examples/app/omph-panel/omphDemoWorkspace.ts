/**
 * OMPHPanel 示例工作区
 *
 * 内容大纲：
 * - 内存里的虚拟文件：Markdown、代码、JSON、图片、超长日志
 * - 缺失文件、不支持的类型、第一次读取会失败的文件
 * - 模拟网络延迟并响应取消的加载函数
 *
 * 作者：ORBAICODER
 * 版本：1.0.0
 * 日期：2026-10-04
 *
 * 作用：给 /omph-panel 的文件预览提供演示数据。真实应用里，加载函数由宿主按自己的文件来源实现。
 *
 * 代码逻辑大纲：
 * 1. 路径先规整（去掉开头的 ./ 和 /），再查表。
 * 2. 查不到返回 missing；zip 返回 unsupported；flaky.csv 第一次抛错，之后成功。
 * 3. 延迟用定时器模拟，signal 被中止时清掉定时器并拒绝。
 *
 * ChangeLog：
 * - 1.0.0 2026-10-04 初始版本。
 */

import type { OMPHFilePreviewData, OMPHFilePreviewLoader } from 'orbcafe-ui'

const LOAD_DELAY_MS = 450
const LOG_LINE_COUNT = 2600
const FLAKY_PATH = 'data/flaky.csv'

const PLAN_MARKDOWN = `# Line 2 re-plan

Line 2 is the constraint for this week. The plan keeps the frozen sequence and moves urgent orders into the next free slot.

## Steps

1. Freeze the current production sequence.
2. Move urgent orders to the next available slot.
3. Notify the responsible planner.

## Capacity

| Order | Material | Hours |
| :--- | :--- | ---: |
| 4500012383 | FERT-22901 | 6.5 |
| 4500012379 | Valve block | 4.0 |
| 4500012381 | ROH-100234 | 3.5 |

> Recovered capacity: **14 hours**. The check lives in \`src/capacity.ts\`.
`

const CAPACITY_SOURCE = `/**
 * Capacity check for the weekly re-plan.
 */

export interface SlotOrder {
  orderId: string
  hours: number
  urgent: boolean
}

const RECOVERY_THRESHOLD_HOURS = 8

export const recoverableHours = (orders: SlotOrder[], available: number): number => {
  const planned = orders.reduce((sum, order) => sum + order.hours, 0)
  return Math.max(0, available - planned)
}

export const decideAction = (orders: SlotOrder[], available: number) => {
  const recovered = recoverableHours(orders, available)
  const hasUrgent = orders.some((order) => order.urgent)

  if (recovered >= RECOVERY_THRESHOLD_HOURS && hasUrgent) {
    return { action: 're-plan', recovered }
  }
  if (recovered > 0) {
    return { action: 'monitor', recovered }
  }
  return { action: 'hold', recovered }
}

export const utilization = (orders: SlotOrder[], available: number): number => {
  if (available <= 0) return 0
  const planned = orders.reduce((sum, order) => sum + order.hours, 0)
  return Math.round((planned / available) * 100)
}
`

const ORDERS_JSON = JSON.stringify(
  {
    plant: '1000',
    orders: [
      { orderId: '4500012383', material: 'FERT-22901', hours: 6.5, urgent: true },
      { orderId: '4500012379', material: 'Valve block', hours: 4, urgent: false },
      { orderId: '4500012381', material: 'ROH-100234', hours: 3.5, urgent: true },
    ],
  },
  null,
  2,
)

const LAYOUT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
  <rect width="720" height="360" fill="#ffffff"/>
  <g font-family="Montserrat, system-ui, sans-serif" font-size="14" fill="#555555">
    <text x="32" y="44" font-weight="600" font-size="16">Line 2 · weekly slots</text>
    <rect x="32" y="72" width="640" height="40" rx="8" fill="#eef2f9"/>
    <rect x="32" y="72" width="410" height="40" rx="8" fill="#154194"/>
    <text x="48" y="98" fill="#ffffff">Frozen sequence</text>
    <text x="458" y="98">Free slot</text>
    <rect x="32" y="136" width="640" height="40" rx="8" fill="#eef2f9"/>
    <rect x="32" y="136" width="520" height="40" rx="8" fill="#154194" fill-opacity="0.6"/>
    <text x="48" y="162" fill="#ffffff">Line 3</text>
    <rect x="32" y="200" width="640" height="40" rx="8" fill="#eef2f9"/>
    <rect x="32" y="200" width="300" height="40" rx="8" fill="#154194" fill-opacity="0.35"/>
    <text x="48" y="226">Line 4</text>
    <text x="32" y="296" fill="#8c8c8c">Recovered capacity: 14 h</text>
  </g>
</svg>`

const buildRunLog = () => Array.from({ length: LOG_LINE_COUNT }, (_, index) => {
  const line = index + 1
  const level = line % 97 === 0 ? 'WARN' : 'INFO'
  return `2024-01-01T09:${String(Math.floor(line / 60) % 60).padStart(2, '0')}:${String(line % 60).padStart(2, '0')} ${level} slot-scheduler step=${line} queue=${line % 12}`
}).join('\n')

const WORKSPACE: Record<string, OMPHFilePreviewData> = {
  'docs/line2-plan.md': { body: { kind: 'markdown', text: PLAN_MARKDOWN }, size: PLAN_MARKDOWN.length },
  'src/capacity.ts': { body: { kind: 'code', text: CAPACITY_SOURCE, language: 'typescript' }, size: CAPACITY_SOURCE.length },
  'data/orders.json': { body: { kind: 'code', text: ORDERS_JSON, language: 'json' }, size: ORDERS_JSON.length },
  'assets/line2-layout.svg': {
    body: { kind: 'image', url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LAYOUT_SVG)}`, alt: 'Line 2 weekly slots' },
    size: LAYOUT_SVG.length,
  },
  'logs/run.log': { body: { kind: 'code', text: buildRunLog() }, size: LOG_LINE_COUNT * 72 },
  'archive/q3.zip': { body: { kind: 'unsupported', message: 'Archives cannot be previewed here.' }, size: 482_113 },
}

const normalize = (path: string) => path.replace(/^\.?\//, '')

/** 生成一个加载函数。flaky.csv 的“第一次失败”状态属于这个函数实例。 */
export const createDemoFileLoader = (): OMPHFilePreviewLoader => {
  let flakyFailed = false

  return (ref, signal) => new Promise<OMPHFilePreviewData>((resolve, reject) => {
    const path = normalize(ref.path)
    const timer = window.setTimeout(() => {
      if (path === FLAKY_PATH && !flakyFailed) {
        flakyFailed = true
        reject(new Error('Transient read failure'))
        return
      }
      if (path === FLAKY_PATH) {
        resolve({ body: { kind: 'code', text: 'order,hours\n4500012383,6.5\n4500012379,4.0\n' }, size: 42 })
        return
      }
      resolve(WORKSPACE[path] ?? { body: { kind: 'missing' } })
    }, LOAD_DELAY_MS)

    signal.addEventListener('abort', () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}
