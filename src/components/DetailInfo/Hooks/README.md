# DetailInfo Hooks

## `useDetailInfo`

`useDetailInfo` 是 `CDetailInfoPage` 的核心状态 Hook，负责：

- Query 输入与状态
- Tabs 激活态
- 字段搜索命中
- 无命中时 AI 回退
- 状态文案（matches / no match / ai fallback）

### 入参

| Field | Type | Description |
| --- | --- | --- |
| `sections` | `DetailInfoSection[]` | 详情信息块 |
| `tabs` | `DetailInfoTab[]` | Tab 列表 |
| `defaultTabId` | `string` | 默认激活 Tab |
| `ai` | `DetailInfoAiConfig` | AI 配置 |

### 返回值

| Field | Type | Description |
| --- | --- | --- |
| `query` | `string` | 当前输入 |
| `setQuery` | `(value: string) => void` | 更新输入 |
| `activeTabId` | `string \| undefined` | 当前 Tab |
| `setActiveTabId` | `(value: string) => void` | 切换 Tab |
| `searchMode` | `'idle' \| 'search' \| 'ai'` | 当前模式 |
| `hits` | `DetailInfoSearchHit[]` | 搜索命中 |
| `statusText` | `string` | 状态提示文案 |
| `aiResponse` | `string` | AI 文本结果 |
| `searching` | `boolean` | 提交中状态 |
| `handleSubmit` | `() => Promise<void>` | 提交搜索/AI |
| `clearResult` | `() => void` | 清空结果 |

### 行为顺序

1. 用户提交 query
2. 先在 `sections + tabs` 字段中搜索
3. 有命中：进入 `search` 模式，返回 `hits`
4. 无命中：若配置 `ai.onSubmit`，进入 `ai` 模式并执行回调
