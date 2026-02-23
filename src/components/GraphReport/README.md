# GraphReport

图形报表模块（依附于 StdReport 使用）。

## 定位

- GraphReport 不是独立业务容器，通常由 StdReport 的工具栏入口触发。
- 数据输入建议通过 hooks/model 统一传入，内部负责 KPI + 图表 + 表格组合呈现。

## 快速使用

```tsx
import { CGraphReport } from 'orbcafe-ui';
```

## 目录建议

- `Components/`：图表、KPI、容器组件
- `Hooks/`：数据映射、配置与状态逻辑
