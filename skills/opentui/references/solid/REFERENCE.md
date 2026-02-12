# OpenTUI Solid (@opentui/solid)

用于构建终端用户界面的 SolidJS reconciler，具备细粒度响应式特性。通过 Solid 的 signal-based 方法获得最佳性能。

## 概述

OpenTUI Solid 提供：
- **自定义 reconciler**：Solid 组件渲染到 OpenTUI renderables
- **JSX 内置元素**：`<text>`, `<box>`, `<input>` 等
- **Hooks**：`useKeyboard`, `useRenderer`, `useTimeline` 等
- **细粒度响应式**：只有变化的部分会重新渲染
- **Portal & Dynamic**：高级组合原语

## 何时使用 Solid

在以下情况下使用 Solid reconciler：
- 你希望获得最佳的重新渲染性能
- 你更喜欢基于 signal 的响应式
- 你需要对更新进行细粒度控制
- 构建性能关键型应用程序
- 你已经了解 SolidJS

## 何时不应使用 Solid

| 场景 | 改用 |
|----------|-------------|
| 团队熟悉 React 而非 Solid | `@opentui/react` |
| 需要最大控制权 | `@opentui/core` |
| 最小打包体积 | `@opentui/core` |
| 构建框架/库 | `@opentui/core` |

## 快速开始

```bash
bunx create-tui@latest -t solid my-app
cd my-app && bun install
```

CLI 会为你创建 `my-app` 目录 - 该目录必须**不存在**。

选项：`--no-git`（跳过 git init），`--no-install`（跳过 bun install）

**Agent 指导**：始终使用带有 `-t <template>` 标志的自主模式。不要使用交互模式（不带 `-t` 的 `bunx create-tui@latest my-app`），因为它需要用户提示，而 Agent 无法响应。

或者手动安装：

```bash
bun install @opentui/solid @opentui/core solid-js
```

```tsx
import { render } from "@opentui/solid"
import { createSignal } from "solid-js"

function App() {
  const [count, setCount] = createSignal(0)
  
  return (
    <box border padding={2}>
      <text>Count: {count()}</text>
      <box
        border
        onMouseDown={() => setCount(c => c + 1)}
      >
        <text>Click me!</text>
      </box>
    </box>
  )
}

render(() => <App />)
```

## 核心概念

### Signals

Solid 使用 signals 实现响应式状态：

```tsx
import { createSignal, createEffect } from "solid-js"

function Counter() {
  const [count, setCount] = createSignal(0)

  // 当 count 变化时，Effect 会运行
  createEffect(() => {
    console.log("Count is now:", count())
  })

  return <text>Count: {count()}</text>
}
```

### JSX 元素

Solid 将 JSX 内置元素映射到 OpenTUI renderables：

```tsx
// 注意：有些使用下划线（Solid 约定）
<text>Hello</text>           // TextRenderable
<box border>Content</box>    // BoxRenderable
<input placeholder="..." />  // InputRenderable
<select options={[...]} />   // SelectRenderable
<tab_select />               // TabSelectRenderable（下划线！）
<ascii_font />               // ASCIIFontRenderable（下划线！）
<line_number />              // LineNumberRenderable（下划线！）
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

## 可用组件

### 布局与显示
- `<text>` - 样式化文本内容
- `<box>` - 带边框和布局的容器
- `<scrollbox>` - 可滚动容器
- `<ascii_font>` - ASCII 艺术文本（注意下划线）

### 输入
- `<input>` - 单行文本输入
- `<textarea>` - 多行文本输入
- `<select>` - 列表选择
- `<tab_select>` - 基于 Tab 的选择（注意下划线）

### 代码与差异
- `<code>` - 语法高亮代码
- `<line_number>` - 带行号的代码（注意下划线）
- `<diff>` - 统一或分割的差异查看器

### 文本修饰符（在 `<text>` 内部）
- `<span>` - 内联样式文本
- `<strong>`, `<b>` - 粗体
- `<em>`, `<i>` - 斜体
- `<u>` - 下划线
- `<br>` - 换行
- `<a>` - 链接

## 特殊组件

### Portal

将子组件渲染到不同的挂载节点：

```tsx
import { Portal } from "@opentui/solid"

function Overlay() {
  return (
    <Portal mount={renderer.root}>
      <box position="absolute" left={10} top={5} border>
        <text>Overlay content</text>
      </box>
    </Portal>
  )
}
```

### Dynamic

动态渲染组件：

```tsx
import { Dynamic } from "@opentui/solid"

function DynamicInput(props: { multiline: boolean }) {
  return (
    <Dynamic
      component={props.multiline ? "textarea" : "input"}
      placeholder="Enter text..."
    />
  )
}
```

## 本参考文档包含

- [配置](./configuration.md) - 项目设置、tsconfig、bunfig、构建
- [API](./api.md) - 组件、hooks、render 函数
- [模式](./patterns.md) - Signals、stores、控制流、组合
- [注意事项](./gotchas.md) - 常见问题、调试、限制

## 另请参阅

- [核心](../core/REFERENCE.md) - 底层命令式 API
- [React](../react/REFERENCE.md) - 替代的声明式方法
- [组件](../components/REFERENCE.md) - 按类别分类的组件参考
- [布局](../layout/REFERENCE.md) - Flexbox 布局系统
- [键盘](../keyboard/REFERENCE.md) - 输入处理和快捷键
- [测试](../testing/REFERENCE.md) - 测试渲染器和快照
