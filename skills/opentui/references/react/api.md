# React API 参考

## 渲染

### createRoot(renderer)

创建用于渲染的 React 根。

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

const renderer = await createCliRenderer({
  exitOnCtrlC: false,  // 自己处理 Ctrl+C
})

const root = createRoot(renderer)
root.render(<App />)
```

## Hooks

### useRenderer()

访问 OpenTUI renderer 实例。

```tsx
import { useRenderer } from "@opentui/react"
import { useEffect } from "react"

function App() {
  const renderer = useRenderer()

  useEffect(() => {
    // 访问 renderer 属性
    console.log(`Terminal: ${renderer.width}x${renderer.height}`)

    // 显示调试控制台
    renderer.console.show()
  }, [renderer])

  return <text>Hello</text>
}
```

### useKeyboard(handler, options?)

处理键盘事件。

```tsx
import { useKeyboard, useRenderer } from "@opentui/react"

function App() {
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "escape") {
      renderer.destroy()  // 永远不要直接使用 process.exit()！
    }
    if (key.ctrl && key.name === "s") {
      saveDocument()
    }
  })

  return <text>Press ESC to exit</text>
}

// 包含释放事件
function GameControls() {
  const [pressed, setPressed] = useState(new Set<string>())

  useKeyboard(
    (event) => {
      setPressed(keys => {
        const newKeys = new Set(keys)
        if (event.eventType === "release") {
          newKeys.delete(event.name)
        } else {
          newKeys.add(event.name)
        }
        return newKeys
      })
    },
    { release: true }  // 包含释放事件
  )

  return <text>Pressed: {Array.from(pressed).join(", ")}</text>
}
```

**选项：**
- `release?: boolean` - 包含按键释放事件（默认：false）

**KeyEvent 属性：**
- `name: string` - 按键名称（"a"、"escape"、"f1" 等）
- `sequence: string` - 原始转义序列
- `ctrl: boolean` - Ctrl 修饰符
- `shift: boolean` - Shift 修饰符
- `meta: boolean` - Alt 修饰符
- `option: boolean` - Option 修饰符（macOS）
- `eventType: "press" | "release" | "repeat"`
- `repeated: boolean` - 按键正在被按住

### useOnResize(callback)

处理终端调整大小事件。

```tsx
import { useOnResize } from "@opentui/react"

function App() {
  useOnResize((width, height) => {
    console.log(`Resized to ${width}x${height}`)
  })

  return <text>Resize the terminal</text>
}
```

### useTerminalDimensions()

获取响应式终端尺寸。

```tsx
import { useTerminalDimensions } from "@opentui/react"

function ResponsiveLayout() {
  const { width, height } = useTerminalDimensions()

  return (
    <box flexDirection={width > 80 ? "row" : "column"}>
      <box flexGrow={1}>
        <text>Width: {width}</text>
      </box>
      <box flexGrow={1}>
        <text>Height: {height}</text>
      </box>
    </box>
  )
}
```

### useTimeline(options?)

使用时间轴系统创建动画。

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function AnimatedBox() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({
    duration: 2000,
    loop: false,
  })

  useEffect(() => {
    timeline.add(
      { width: 0 },
      {
        width: 50,
        duration: 2000,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].width))
        },
      }
    )
  }, [timeline])

  return <box style={{ width, height: 3, backgroundColor: "#6a5acd" }} />
}
```

**选项：**
- `duration?: number` - 默认持续时间（毫秒）
- `loop?: boolean` - 循环时间轴
- `autoplay?: boolean` - 自动开始（默认：true）
- `onComplete?: () => void` - 完成回调
- `onPause?: () => void` - 暂停回调

**Timeline 方法：**
- `add(target, properties, startTime?)` - 添加动画
- `play()` - 开始播放
- `pause()` - 暂停播放
- `restart()` - 从头重新开始

## 组件

### Text 组件

```tsx
<text
  content="Hello"           // 或者使用 children
  fg="#FFFFFF"              // 前景色
  bg="#000000"              // 背景色
  selectable={true}         // 允许文本选择
>
  {/* 使用嵌套修饰符标签进行样式设置 */}
  <span fg="red">Red</span>
  <strong>Bold</strong>
  <em>Italic</em>
  <u>Underline</u>
  <br />
  <a href="https://...">Link</a>
</text>
```

> **注意**：不要在 `<text>` 上将 `bold`、`italic`、`underline` 作为 props 使用。请改用嵌套的修饰符标签，如 `<strong>`、`<em>`、`<u>`。

### Box 组件

```tsx
<box
  // 边框
  border                    // 启用边框
  borderStyle="single"      // single | double | rounded | bold
  borderColor="#FFFFFF"
  title="Title"
  titleAlignment="center"   // left | center | right

  // 颜色
  backgroundColor="#1a1a2e"

  // 布局（参见 layout/REFERENCE.md）
  flexDirection="row"
  justifyContent="center"
  alignItems="center"
  gap={2}

  // 间距
  padding={2}
  paddingTop={1}
  margin={1}

  // 尺寸
  width={40}
  height={10}
  flexGrow={1}

  // 事件
  onMouseDown={(e) => {}}
  onMouseUp={(e) => {}}
  onMouseMove={(e) => {}}
>
  {children}
</box>
```

### Scrollbox 组件

```tsx
<scrollbox
  focused                   // 启用键盘滚动
  style={{
    rootOptions: { backgroundColor: "#24283b" },
    wrapperOptions: { backgroundColor: "#1f2335" },
    viewportOptions: { backgroundColor: "#1a1b26" },
    contentOptions: { backgroundColor: "#16161e" },
    scrollbarOptions: {
      showArrows: true,
      trackOptions: {
        foregroundColor: "#7aa2f7",
        backgroundColor: "#414868",
      },
    },
  }}
>
  {/* 可滚动内容 */}
  {items.map((item, i) => (
    <box key={i}>
      <text>{item}</text>
    </box>
  ))}
</scrollbox>
```

### Input 组件

```tsx
<input
  value={value}
  onChange={(newValue) => setValue(newValue)}
  placeholder="Enter text..."
  focused                   // 开始时获得焦点
  width={30}
  backgroundColor="#1a1a1a"
  textColor="#FFFFFF"
  cursorColor="#00FF00"
  focusedBackgroundColor="#2a2a2a"
/>
```

### Textarea 组件

```tsx
<textarea
  value={text}
  onChange={(newValue) => setText(newValue)}
  placeholder="Enter multiple lines..."
  focused
  width={40}
  height={10}
  showLineNumbers
  wrapText
/>
```

### Select 组件

```tsx
<select
  options={[
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ]}
  onChange={(index, option) => setSelected(option)}
  selectedIndex={0}
  focused
  showScrollIndicator
  height={8}
/>
```

### Tab Select 组件

```tsx
<tab-select
  options={[
    { name: "Home", description: "Dashboard" },
    { name: "Settings", description: "Configuration" },
  ]}
  onChange={(index, option) => setTab(option)}
  tabWidth={20}
  focused
/>
```

### ASCII Font 组件

```tsx
<ascii-font
  text="TITLE"
  font="tiny"               // tiny | block | slick | shade
  color="#FFFFFF"
/>
```

### Code 组件

```tsx
<code
  code={sourceCode}
  language="typescript"
  showLineNumbers
  highlightLines={[1, 5, 10]}
/>
```

### Line Number 组件

```tsx
<line-number
  code={sourceCode}
  language="typescript"
  startLine={1}
  highlightedLines={[5]}
  diagnostics={[
    { line: 3, severity: "error", message: "Syntax error" }
  ]}
/>
```

### Diff 组件

```tsx
<diff
  oldCode={originalCode}
  newCode={modifiedCode}
  language="typescript"
  mode="unified"            // unified | split
  showLineNumbers
/>
```

## 类型导出

```tsx
import type {
  // Component props
  TextProps,
  BoxProps,
  InputProps,
  SelectProps,

  // Hook types
  KeyEvent,

  // From core
  CliRenderer,
} from "@opentui/react"
```
