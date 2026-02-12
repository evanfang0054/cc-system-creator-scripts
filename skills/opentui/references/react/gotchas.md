# React 常见问题

## 关键问题

### 永远不要直接使用 `process.exit()`

**这是最常见的错误。**使用 `process.exit()` 会使终端处于损坏状态（光标隐藏、原始模式、备用屏幕）。

```tsx
// 错误 - 终端处于损坏状态
process.exit(0)

// 正确 - 使用 renderer.destroy()
import { useRenderer } from "@opentui/react"

function App() {
  const renderer = useRenderer()

  const handleExit = () => {
    renderer.destroy()  // 正确清理并退出
  }
}
```

`renderer.destroy()` 在退出之前会恢复终端（退出备用屏幕、恢复光标等）。

## JSX 配置

### 缺少 jsxImportSource

**症状**：JSX 元素类型错误，组件无法渲染

```
// Error: Property 'text' does not exist on type 'JSX.IntrinsicElements'
```

**修复**：配置 tsconfig.json：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react"
  }
}
```

### HTML 元素 vs TUI 元素

OpenTUI 的 JSX 元素**不是** HTML 元素：

```tsx
// 错误 - 这些是 HTML 概念
<div>Not supported</div>
<button>Not supported</button>
<span>Only works inside <text></span>

// 正确 - OpenTUI 元素
<box>Container</box>
<text>Display text</text>
<text><span>Inline styled</span></text>
```

## 组件问题

### 文本修饰符在文本之外

文本修饰符仅在 `<text>` 内部有效：

```tsx
// 错误
<box>
  <strong>This won't work</strong>
</box>

// 正确
<box>
  <text>
    <strong>This works</strong>
  </text>
</box>
```

### 焦点不工作

组件必须显式获得焦点：

```tsx
// 错误 - 不会接收键盘输入
<input placeholder="Type here..." />

// 正确
<input placeholder="Type here..." focused />

// 或者管理焦点状态
const [isFocused, setIsFocused] = useState(true)
<input placeholder="Type here..." focused={isFocused} />
```

### Select 不响应

Select 需要焦点和正确的选项格式：

```tsx
// 错误 - 缺少必需的属性
<select options={["a", "b", "c"]} />

// 正确
<select
  options={[
    { name: "Option A", description: "First option", value: "a" },
    { name: "Option B", description: "Second option", value: "b" },
  ]}
  onSelect={(index, option) => {
    // 当按下 Enter 时调用
    console.log("Selected:", option.name)
  }}
  focused
/>
```

### Select 事件混淆

记住：`onSelect` 在 Enter 时触发（选择确认），`onChange` 在导航时触发：

```tsx
// 错误 - 期望 onChange 在 Enter 时触发
<select
  options={options}
  onChange={(i, opt) => submitForm(opt)}  // 这在箭头键时触发！
/>

// 正确
<select
  options={options}
  onSelect={(i, opt) => submitForm(opt)}   // 按下 Enter - 提交
  onChange={(i, opt) => showPreview(opt)}  // 箭头键 - 预览
/>
```

## Hook 问题

### useKeyboard 不触发

多个 `useKeyboard` hooks 可能冲突：

```tsx
// 两个处理程序都会触发 - 可能导致问题
function App() {
  useKeyboard((key) => { /* 父处理程序 */ })
  return <ChildWithKeyboard />
}

function ChildWithKeyboard() {
  useKeyboard((key) => { /* 子处理程序 */ })
  return <text>Child</text>
}
```

**解决方案**：使用单个键盘处理程序或实现事件停止：

```tsx
function App() {
  const [handled, setHandled] = useState(false)

  useKeyboard((key) => {
    if (handled) {
      setHandled(false)
      return
    }
    // 在应用级别处理
  })

  return <Child onKeyHandled={() => setHandled(true)} />
}
```

### useEffect 清理

始终清理 intervals 和 listeners：

```tsx
// 错误 - 内存泄漏
useEffect(() => {
  setInterval(() => updateData(), 1000)
}, [])

// 正确
useEffect(() => {
  const interval = setInterval(() => updateData(), 1000)
  return () => clearInterval(interval)  // 清理！
}, [])
```

## 样式问题

### 颜色不应用

检查颜色格式：

```tsx
// 正确格式
<text fg="#FF0000">Red</text>
<text fg="red">Red</text>
<box backgroundColor="#1a1a2e">Box</box>

// 错误
<text fg="FF0000">Missing #</text>
<text color="#FF0000">Wrong prop name (use fg)</text>
```

### 布局不工作

确保父元素有尺寸：

```tsx
// 错误 - 父元素没有高度
<box flexDirection="column">
  <box flexGrow={1}>Won't grow</box>
</box>

// 正确
<box flexDirection="column" height="100%">
  <box flexGrow={1}>Will grow</box>
</box>
```

### 百分比宽度不工作

父元素必须有明确尺寸：

```tsx
// 错误
<box>
  <box width="50%">Won't work</box>
</box>

// 正确
<box width="100%">
  <box width="50%">Works</box>
</box>
```

## 性能问题

### 重渲染过多

避免 props 中的内联对象/函数：

```tsx
// 错误 - 每次渲染都是新对象
<box style={{ padding: 2 }}>Content</box>

// 更好 - 使用直接 props
<box padding={2}>Content</box>

// 或记忆化样式对象
const style = useMemo(() => ({ padding: 2 }), [])
<box style={style}>Content</box>
```

### 重型组件

对昂贵的组件使用 React.memo：

```tsx
const ExpensiveList = React.memo(function ExpensiveList({
  items
}: {
  items: Item[]
}) {
  return (
    <box flexDirection="column">
      {items.map(item => (
        <text key={item.id}>{item.name}</text>
      ))}
    </box>
  )
})
```

### 渲染期间的状态更新

不要在渲染期间更新状态：

```tsx
// 错误
function Component({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  // 这会导致无限循环！
  if (value > 10) {
    setCount(value)
  }

  return <text>{count}</text>
}

// 正确
function Component({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value > 10) {
      setCount(value)
    }
  }, [value])

  return <text>{count}</text>
}
```

## 调试

### 控制台不可见

OpenTUI 捕获控制台输出。显示覆盖层：

```tsx
import { useRenderer } from "@opentui/react"
import { useEffect } from "react"

function App() {
  const renderer = useRenderer()

  useEffect(() => {
    renderer.console.show()
    console.log("Now you can see this!")
  }, [renderer])

  return <box>{/* ... */}</box>
}
```

### 组件不渲染

检查组件是否在树中：

```tsx
// 错误 - 条件返回空值
function MaybeComponent({ show }: { show: boolean }) {
  if (!show) return  // 返回 undefined！
  return <text>Visible</text>
}

// 正确
function MaybeComponent({ show }: { show: boolean }) {
  if (!show) return null  // 显式返回 null
  return <text>Visible</text>
}
```

### 事件不触发

检查事件处理程序名称：

```tsx
// 错误
<box onClick={() => {}}>Click</box>  // TUI 中没有 onClick

// 正确
<box onMouseDown={() => {}}>Click</box>
<box onMouseUp={() => {}}>Click</box>
```

## 运行时问题

### 使用 Bun，不是 Node

```bash
# 错误
node src/index.tsx
npm run start

# 正确
bun run src/index.tsx
bun run start
```

### 异步顶层

Bun 支持顶层 await，但要小心：

```tsx
// index.tsx - 这在 Bun 中有效
const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)

// 如果需要处理错误
try {
  const renderer = await createCliRenderer()
  createRoot(renderer).render(<App />)
} catch (error) {
  console.error("Failed to initialize:", error)
  process.exit(1)
}
```

## 常见错误消息

### "Cannot read properties of undefined (reading 'root')"

Renderer 未初始化：

```tsx
// 错误
const renderer = createCliRenderer()  // 缺少 await！
createRoot(renderer).render(<App />)

// 正确
const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

### "Invalid hook call"

在组件外部调用 hooks：

```tsx
// 错误
const dimensions = useTerminalDimensions()  // 在组件外部！

function App() {
  return <text>{dimensions.width}</text>
}

// 正确
function App() {
  const dimensions = useTerminalDimensions()
  return <text>{dimensions.width}</text>
}
```
