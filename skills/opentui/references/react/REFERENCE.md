# OpenTUI React (@opentui/react)

一个用于构建终端用户界面的 React reconciler，使用熟悉的 React 模式。使用 JSX、hooks 和组件组合编写 TUI。

## 概述

OpenTUI React 提供：
- **自定义 reconciler**：React 组件渲染为 OpenTUI 可渲染对象
- **JSX 内置元素**：`<text>`、`<box>`、`<input>` 等
- **Hooks**：`useKeyboard`、`useRenderer`、`useTimeline` 等
- **完全的 React 兼容性**：useState、useEffect、context 等

## 何时使用 React

在以下情况下使用 React reconciler：
- 您熟悉 React 模式
- 您需要声明式 UI 组合
- 您需要 React 的生态系统（context、状态管理库）
- 构建具有复杂状态的应用程序
- 团队已经了解 React

## 何时不使用 React

| 场景 | 改用 |
|----------|-------------|
| 性能最关键 | `@opentui/core`（命令式） |
| 细粒度响应式 | `@opentui/solid` |
| 最小的包大小 | `@opentui/core` |
| 构建框架/库 | `@opentui/core` |

## 快速开始

```bash
bunx create-tui@latest -t react my-app
cd my-app
bun run src/index.tsx
```

CLI 会为您创建 `my-app` 目录 - 该目录**必须不存在**。

**Agent 指导**：始终使用带有 `-t <template>` 标志的自主模式。永远不要使用交互模式（不带 `-t` 的 `bunx create-tui@latest my-app`），因为它需要用户提示，而 agent 无法响应。

或者手动设置：

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/react @opentui/core react
```

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState } from "react"

function App() {
  const [count, setCount] = useState(0)

  return (
    <box border padding={2}>
      <text>Count: {count}</text>
      <box
        border
        onMouseDown={() => setCount(c => c + 1)}
      >
        <text>Click me!</text>
      </box>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

## 核心概念

### JSX 元素

React 将 JSX 内置元素映射到 OpenTUI 可渲染对象：

```tsx
// 这些不是 HTML 元素！
<text>Hello</text>           // TextRenderable
<box border>Content</box>    // BoxRenderable
<input placeholder="..." />  // InputRenderable
<select options={[...]} />   // SelectRenderable
```

### 文本修饰符

在 `<text>` 内部，使用修饰符元素：

```tsx
<text>
  <strong>Bold</strong>, <em>italic</em>, and <u>underlined</u>
  <span fg="red">Colored text</span>
  <br />
  New line with <a href="https://example.com">link</a>
</text>
```

### 样式

两种样式方法：

```tsx
// 直接 props
<box backgroundColor="blue" padding={2} border>
  <text fg="#00FF00">Green text</text>
</box>

// Style prop
<box style={{ backgroundColor: "blue", padding: 2, border: true }}>
  <text style={{ fg: "#00FF00" }}>Green text</text>
</box>
```

## 可用组件

### 布局和显示
- `<text>` - 样式化文本内容
- `<box>` - 带有边框和布局的容器
- `<scrollbox>` - 可滚动容器
- `<ascii-font>` - ASCII 艺术文本

### 输入
- `<input>` - 单行文本输入
- `<textarea>` - 多行文本输入
- `<select>` - 列表选择
- `<tab-select>` - 基于 Tab 的选择

### 代码和差异
- `<code>` - 语法高亮代码
- `<line-number>` - 带行号的代码
- `<diff>` - 统一或分离的差异查看器

### 文本修饰符（在 `<text>` 内部）
- `<span>` - 内联样式文本
- `<strong>`、`<b>` - 粗体
- `<em>`、`<i>` - 斜体
- `<u>` - 下划线
- `<br>` - 换行
- `<a>` - 链接

## 基本 Hooks

```tsx
import {
  useRenderer,
  useKeyboard,
  useOnResize,
  useTerminalDimensions,
  useTimeline,
} from "@opentui/react"
```

有关 hooks 的详细文档，请参阅 [API 参考](./api.md)。

## 本参考包含

- [配置](./configuration.md) - 项目设置、tsconfig、打包
- [API](./api.md) - 组件、hooks、createRoot
- [模式](./patterns.md) - 状态管理、键盘处理、表单
- [常见问题](./gotchas.md) - 常见问题、调试、限制

## 另请参阅

- [Core](../core/REFERENCE.md) - 底层命令式 API
- [Solid](../solid/REFERENCE.md) - 替代的声明式方法
- [Components](../components/REFERENCE.md) - 按类别分类的组件参考
- [Layout](../layout/REFERENCE.md) - Flexbox 布局系统
- [Keyboard](../keyboard/REFERENCE.md) - 输入处理和快捷键
- [Testing](../testing/REFERENCE.md) - 测试渲染器和快照
