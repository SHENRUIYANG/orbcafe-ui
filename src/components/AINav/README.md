# AINav

`AINav` 是一个语音导航能力组件，默认交互链路：

- 长按 `Space` 开始录音
- 释放 `Space` 停止录音
- ASR 结果回调到 `onVoiceSubmit(text)` 执行业务导航

## 组件结构

- `CAINavProvider`：主入口 Provider（热键监听 + 录音流程）
- `useAINav`：获取录音状态与手动控制录音
- `useVoiceInput`：底层录音与 WebSocket 语音输入 Hook
- `CVoiceWaveOverlay` / `COrbCanvas`：录音态视觉层

## 快速使用

```tsx
import { CAINavProvider } from 'orbcafe-ui';

<CAINavProvider
  onVoiceSubmit={async (text) => {
    // 业务侧: 调意图识别后跳转
  }}
>
  {children}
</CAINavProvider>;
```

## `CAINavProvider` 常用参数

| Name | Type | Description |
| --- | --- | --- |
| `onVoiceSubmit` | `(text: string) => void \\| Promise<void>` | 识别完成后的提交回调（必填） |
| `onVoicePartial` | `(text: string) => void` | 实时中间识别文本（可选） |
| `onVoiceError` | `(error: string) => void` | 错误回调（可选） |
| `longPressMs` | `number` | 长按触发时长，默认 `200` |
| `disableSpaceTrigger` | `boolean` | 禁用空格热键，默认 `false` |
| `ignoreWhenFocusedInput` | `boolean` | 输入框聚焦时忽略热键，默认 `true` |
| `renderOverlay` | `boolean` | 是否渲染录音视觉层，默认 `true` |
| `wsUrl` | `string` | 语音服务 WebSocket 地址，默认 `ws://localhost:8765` |
| `silenceThresholdMs` | `number` | 静音自动停止阈值，默认 `2000` |
| `minVolumeRms` | `number` | 判定为有效语音的最小音量，默认 `0.015` |
