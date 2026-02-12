# Solid API 参考

## 渲染

### render(node, rendererOrConfig?)

将 Solid 组件树渲染到 CLI 渲染器中。

```tsx
import { render } from "@opentui/solid"

// 简单用法 - 自动创建渲染器
render(() => <App />)

// 带配置
render(() => <App />, {
  exitOnCtrlC: false,
  targetFPS: 60,
})

// 使用现有渲染器
import { createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()
render(() => <App />, renderer)
```

### testRender(node, options?)

创建用于快照和测试的测试渲染器。

```tsx
import { testRender } from "@opentui/solid"

const testSetup = await testRender(() => <App />, {
  width: 40,
  height: 10,
})

// Access test utilities
testSetup.snapshot()  // Get current render
testSetup.renderer    // Access renderer
```

### extend(components)

将自定义 renderables 注册为 JSX 内置元素。

```tsx
import { extend } from "@opentui/solid"
import { CustomRenderable } from "./custom"

extend({
  custom: CustomRenderable,
})

// 现在可以在 JSX 中使用
<custom prop="value" />
```

### getComponentCatalogue()

返回当前组件目录。

```tsx
import { getComponentCatalogue } from "@opentui/solid"

const catalogue = getComponentCatalogue()
console.log(Object.keys(catalogue))
```

## Hooks

### useRenderer()

访问 OpenTUI 渲染器实例。

```tsx
import { useRenderer } from "@opentui/solid"
import { onMount } from "solid-js"

function App() {
  const renderer = useRenderer()
  
  onMount(() => {
    console.log(`Terminal: ${renderer.width}x${renderer.height}`)
    renderer.console.show()
  })
  
  return <text>Hello</text>
}
```

### useKeyboard(handler, options?)

处理键盘事件。

```tsx
import { useKeyboard, useRenderer } from "@opentui/solid"

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

// 带释放事件
function GameControls() {
  const [pressed, setPressed] = createSignal(new Set<string>())

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
    { release: true }
  )

  return <text>Pressed: {Array.from(pressed()).join(", ")}</text>
}
```

### usePaste(handler)

处理粘贴事件。

```tsx
import { usePaste } from "@opentui/solid"

function PasteHandler() {
  usePaste((text) => {
    console.log("Pasted:", text)
  })

  return <text>Paste something</text>
}
```

### onResize(callback)

处理终端调整大小事件。

```tsx
import { onResize } from "@opentui/solid"

function App() {
  onResize((width, height) => {
    console.log(`Resized to ${width}x${height}`)
  })
  
  return <text>Resize the terminal</text>
}
```

### useTerminalDimensions()

获取响应式终端尺寸。

```tsx
import { useTerminalDimensions } from "@opentui/solid"

function ResponsiveLayout() {
  const dimensions = useTerminalDimensions()

  return (
    <box flexDirection={dimensions().width > 80 ? "row" : "column"}>
      <text>Width: {dimensions().width}</text>
      <text>Height: {dimensions().height}</text>
    </box>
  )
}
```

### useSelectionHandler(handler)

处理文本选择事件。

```tsx
import { useSelectionHandler } from "@opentui/solid"

function SelectableText() {
  useSelectionHandler((selection) => {
    console.log("Selected:", selection.text)
  })
  
  return <text selectable>Select this text</text>
}
```

### useTimeline(options?)

使用时间线系统创建动画。

```tsx
import { useTimeline } from "@opentui/solid"
import { createSignal, onMount } from "solid-js"

function AnimatedBox() {
  const [width, setWidth] = createSignal(0)

  const timeline = useTimeline({
    duration: 2000,
    loop: false,
  })

  onMount(() => {
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
  })

  return <box style={{ width: width(), height: 3, backgroundColor: "#6a5acd" }} />
}
```

## 组件

### 文本组件

```tsx
<text
  content="Hello"           // 或使用 children
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

> **注意**：不要在 `<text>` 上使用 `bold`、`italic`、`underline` 作为 props。应使用嵌套的修饰符标签，如 `<strong>`、`<em>`、`<u>`。

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

  // 布局
  flexDirection="row"
  justifyContent="center"
  alignItems="center"
  gap={2}

  // 间距
  padding={2}
  margin={1}

  // 尺寸
  width={40}
  height={10}
  flexGrow={1}

  // 事件
  onMouseDown={(e) => {}}
  onMouseUp={(e) => {}}
>
  {children}
</box>
```

### Scrollbox 组件

```tsx
<scrollbox
  focused                   // 启用键盘滚动
  style={{
    scrollbarOptions: {
      showArrows: true,
      trackOptions: {
        foregroundColor: "#7aa2f7",
        backgroundColor: "#414868",
      },
    },
  }}
>
  <For each={items()}>
    {(item) => <text>{item}</text>}
  </For>
</scrollbox>
```

### Input 组件

```tsx
<input
  value={value()}
  onInput={(newValue) => setValue(newValue)}
  placeholder="Enter text..."
  focused
  width={30}
/>
```

### Textarea 组件

```tsx
<textarea
  value={text()}
  onInput={(newValue) => setText(newValue)}
  placeholder="Enter multiple lines..."
  focused
  width={40}
  height={10}
/>
```

### Select 组件

```tsx
<select
  options={[
    { name: "Option 1", description: "First", value: "1" },
    { name: "Option 2", description: "Second", value: "2" },
  ]}
  onChange={(index, option) => setSelected(option)}
  selectedIndex={0}
  focused
/>
```

### Tab Select 组件（注意：下划线）

```tsx
<tab_select
  options={[
    { name: "Home", description: "Dashboard" },
    { name: "Settings", description: "Configuration" },
  ]}
  onChange={(index, option) => setTab(option)}
  tabWidth={20}
  focused
/>
```

### ASCII Font 组件（注意：下划线）

```tsx
<ascii_font
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
/>
```

### Line Number 组件（注意：下划线）

```tsx
<line_number
  code={sourceCode}
  language="typescript"
  startLine={1}
  highlightedLines={[5]}
/>
```

### Diff 组件

```tsx
<diff
  oldCode={originalCode}
  newCode={modifiedCode}
  language="typescript"
  mode="unified"            // unified | split
/>
```

## 控制流

Solid 的控制流组件与 OpenTUI 兼容：

### For

```tsx
import { For } from "solid-js"

<For each={items()}>
  {(item, index) => (
    <box key={index()}>
      <text>{item.name}</text>
    </box>
  )}
</For>
```

### Show

```tsx
import { Show } from "solid-js"

<Show when={isVisible()} fallback={<text>Hidden</text>}>
  <text>Visible content</text>
</Show>
```

### Switch/Match

```tsx
import { Switch, Match } from "solid-js"

<Switch>
  <Match when={status() === "loading"}>
    <text>Loading...</text>
  </Match>
  <Match when={status() === "error"}>
    <text fg="red">Error!</text>
  </Match>
  <Match when={status() === "success"}>
    <text fg="green">Success!</text>
  </Match>
</Switch>
```

### Index

```tsx
import { Index } from "solid-js"

<Index each={items()}>
  {(item, index) => (
    <text>{index}: {item().name}</text>
  )}
</Index>
```

## 特殊组件

### Portal

```tsx
import { Portal } from "@opentui/solid"

<Portal mount={targetNode}>
  <box>Portal content</box>
</Portal>
```

### Dynamic

```tsx
import { Dynamic } from "@opentui/solid"

<Dynamic
  component={isMultiline() ? "textarea" : "input"}
  placeholder="Enter text..."
  focused
/>
```
