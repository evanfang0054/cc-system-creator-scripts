# 核心 API 参考

## Renderer（渲染器）

### createCliRenderer(config?)

创建并初始化 CLI 渲染器。

```typescript
import { createCliRenderer, type CliRendererConfig } from "@opentui/core"

const renderer = await createCliRenderer({
  targetFPS: 60,              // 目标每秒帧数
  exitOnCtrlC: true,          // 在 Ctrl+C 时退出进程
  consoleOptions: {           // 调试控制台覆盖层
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
    startInDebugMode: false,
  },
  onDestroy: () => {},        // 清理回调
})
```

### CliRenderer 实例

```typescript
renderer.root              // 根可渲染节点
renderer.width             // 终端宽度（列数）
renderer.height            // 终端高度（行数）
renderer.keyInput          // 键盘事件发射器
renderer.console           // 控制台覆盖层控制器

renderer.start()           // 启动渲染循环
renderer.stop()            // 停止渲染循环
renderer.destroy()         // 清理并退出备用屏幕
renderer.requestRender()   // 请求重新渲染
```

### Console Overlay（控制台覆盖层）

```typescript
renderer.console.show()    // 显示控制台覆盖层
renderer.console.hide()    // 隐藏控制台覆盖层
renderer.console.toggle()  // 切换可见性/焦点
renderer.console.clear()   // 清空控制台内容
```

## Renderables（可渲染组件）

所有 renderables 都扩展自基类 `Renderable` 并共享通用属性。

### 通用属性

```typescript
interface CommonProps {
  id?: string                    // 唯一标识符

  // 定位
  position?: "relative" | "absolute"
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string

  // 尺寸
  width?: number | string | "auto"
  height?: number | string | "auto"
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number

  // Flexbox
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
  alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
  alignContent?: "flex-start" | "flex-end" | "center" | "stretch" | "space-between" | "space-around"

  // 间距
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  margin?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  gap?: number

  // 显示
  display?: "flex" | "none"
  overflow?: "visible" | "hidden" | "scroll"
  zIndex?: number
}
```

### Renderable 方法

```typescript
renderable.add(child)              // 添加子可渲染组件
renderable.remove(child)           // 移除子可渲染组件
renderable.getRenderable(id)       // 通过 ID 查找子组件
renderable.focus()                 // 聚焦此可渲染组件
renderable.blur()                  // 移除焦点
renderable.destroy()               // 销毁并清理

renderable.on(event, handler)      // 添加事件监听器
renderable.off(event, handler)     // 移除事件监听器
renderable.emit(event, ...args)    // 触发事件
```

### TextRenderable

显示样式化的文本内容。

```typescript
import { TextRenderable, TextAttributes, t, bold, fg, underline } from "@opentui/core"

const text = new TextRenderable(renderer, {
  id: "text",
  content: "Hello World",
  fg: "#FFFFFF",                   // Foreground color
  bg: "#000000",                   // Background color
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
  selectable: true,                // Allow text selection
})

// 使用模板字面量的样式化文本
const styled = new TextRenderable(renderer, {
  content: t`${bold("Bold")} and ${fg("#FF0000")(underline("red underlined"))}`,
})
```

**TextAttributes 标志：**
- `TextAttributes.BOLD`
- `TextAttributes.DIM`
- `TextAttributes.ITALIC`
- `TextAttributes.UNDERLINE`
- `TextAttributes.BLINK`
- `TextAttributes.INVERSE`
- `TextAttributes.HIDDEN`
- `TextAttributes.STRIKETHROUGH`

### BoxRenderable

带有边框和布局的容器。

```typescript
import { BoxRenderable } from "@opentui/core"

const box = new BoxRenderable(renderer, {
  id: "box",
  width: 40,
  height: 10,
  backgroundColor: "#1a1a2e",
  border: true,
  borderStyle: "single" | "double" | "rounded" | "bold" | "none",
  borderColor: "#FFFFFF",
  title: "Panel Title",
  titleAlignment: "left" | "center" | "right",
  onMouseDown: (event) => {},
  onMouseUp: (event) => {},
  onMouseMove: (event) => {},
})
```

### InputRenderable

单行文本输入。

```typescript
import { InputRenderable, InputRenderableEvents } from "@opentui/core"

const input = new InputRenderable(renderer, {
  id: "input",
  width: 30,
  placeholder: "Enter text...",
  value: "",                       // 初始值
  backgroundColor: "#1a1a1a",
  textColor: "#FFFFFF",
  cursorColor: "#00FF00",
  focusedBackgroundColor: "#2a2a2a",
})

input.on(InputRenderableEvents.CHANGE, (value: string) => {
  console.log("Value:", value)
})

input.focus()  // 必须聚焦才能接收输入
```

### SelectRenderable

列表选择组件。

```typescript
import { SelectRenderable, SelectRenderableEvents } from "@opentui/core"

const select = new SelectRenderable(renderer, {
  id: "select",
  width: 30,
  height: 10,
  options: [
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ],
  selectedIndex: 0,
})

// 当按下 Enter 键时调用 - 确认选择
select.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Selected:", option.name)
  performAction(option)
})

// 当使用方向键导航时调用
select.on(SelectRenderableEvents.SELECTION_CHANGED, (index, option) => {
  console.log("Browsing:", option.name)
  showPreview(option)
})

select.focus()  // 使用 up/down/j/k 导航，按 enter 选择
```

**事件区别：**
- `ITEM_SELECTED` - 按下 Enter 键，用户确认选择
- `SELECTION_CHANGED` - 使用方向键，用户正在浏览选项

### TabSelectRenderable

水平标签选择。

```typescript
import { TabSelectRenderable, TabSelectRenderableEvents } from "@opentui/core"

const tabs = new TabSelectRenderable(renderer, {
  id: "tabs",
  width: 60,
  options: [
    { name: "Home", description: "Dashboard" },
    { name: "Settings", description: "Configuration" },
  ],
  tabWidth: 20,
})

// 当按下 Enter 键时调用 - 选中标签
tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Tab selected:", option.name)
  switchToTab(index)
})

// 当使用方向键导航时调用
tabs.on(TabSelectRenderableEvents.SELECTION_CHANGED, (index, option) => {
  console.log("Browsing tab:", option.name)
})

tabs.focus()  // 使用 left/right/[/] 导航，按 enter 选择
```

**事件区别**（与 SelectRenderable 相同）：
- `ITEM_SELECTED` - 按下 Enter 键，用户确认标签
- `SELECTION_CHANGED` - 使用方向键，用户正在浏览标签

### ScrollBoxRenderable

可滚动容器。

```typescript
import { ScrollBoxRenderable } from "@opentui/core"

const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "scrollbox",
  width: 40,
  height: 20,
  showScrollbar: true,
  scrollbarOptions: {
    showArrows: true,
    trackOptions: {
      foregroundColor: "#7aa2f7",
      backgroundColor: "#414868",
    },
  },
})

// 添加超出视口的内容
for (let i = 0; i < 100; i++) {
  scrollbox.add(new TextRenderable(renderer, {
    id: `line-${i}`,
    content: `Line ${i}`,
  }))
}

scrollbox.focus()  // 使用方向键滚动
```

### ASCIIFontRenderable

ASCII 艺术文本。

```typescript
import { ASCIIFontRenderable, RGBA } from "@opentui/core"

const title = new ASCIIFontRenderable(renderer, {
  id: "title",
  text: "OPENTUI",
  font: "tiny" | "block" | "slick" | "shade",
  color: RGBA.fromHex("#FFFFFF"),
})
```

### FrameBufferRenderable

低级 2D 渲染表面。

```typescript
import { FrameBufferRenderable, RGBA } from "@opentui/core"

const canvas = new FrameBufferRenderable(renderer, {
  id: "canvas",
  width: 50,
  height: 20,
})

// 直接像素操作
canvas.frameBuffer.fillRect(10, 5, 20, 8, RGBA.fromHex("#FF0000"))
canvas.frameBuffer.drawText("Custom", 12, 7, RGBA.fromHex("#FFFFFF"))
canvas.frameBuffer.setCell(x, y, char, fg, bg)
```

## Constructs（VNode API）

创建 VNode 而不是直接实例的声明式包装器。

```typescript
import { Text, Box, Input, Select, instantiate, delegate } from "@opentui/core"

// Create VNode tree
const ui = Box(
  { border: true, padding: 1 },
  Text({ content: "Hello" }),
  Input({ placeholder: "Type here..." }),
)

// Instantiate onto renderer
renderer.root.add(ui)

// Delegate focus to nested element
const form = delegate(
  { focus: "email-input" },
  Box(
    {},
    Text({ content: "Email:" }),
    Input({ id: "email-input", placeholder: "you@example.com" }),
  ),
)
form.focus()  // Focuses the input, not the box
```

## 颜色（RGBA）

`RGBA` 类从 `@opentui/core` 导出，但在**所有框架**（Core、React、Solid）中都可以使用。它用于程序化的颜色操作。

### 创建颜色

```typescript
import { RGBA, parseColor } from "@opentui/core"

// 从十六进制字符串（最常见）
RGBA.fromHex("#FF0000")           // 完整十六进制
RGBA.fromHex("#F00")              // 简短十六进制

// 从整数（0-255 范围）
RGBA.fromInts(255, 0, 0, 255)     // r, g, b, a - 完全不透明的红色
RGBA.fromInts(255, 0, 0, 128)     // 50% 透明的红色
RGBA.fromInts(0, 0, 0, 0)         // 完全透明

// 从标准化浮点数（0.0-1.0 范围）
RGBA.fromValues(1.0, 0.0, 0.0, 1.0)   // 完全不透明的红色
RGBA.fromValues(0.1, 0.1, 0.1, 0.7)   // 深灰色，70% 不透明
RGBA.fromValues(0.0, 0.5, 1.0, 1.0)   // 浅蓝色
```

### 常见颜色模式

```typescript
// 主题颜色
const primary = RGBA.fromHex("#7aa2f7")      // Tokyo Night 蓝色
const background = RGBA.fromHex("#1a1a2e")
const foreground = RGBA.fromHex("#c0caf5")
const error = RGBA.fromHex("#f7768e")

// 覆盖层和阴影
const modalOverlay = RGBA.fromValues(0.0, 0.0, 0.0, 0.5)  // 50% 黑色
const shadow = RGBA.fromInts(0, 0, 0, 77)                  // 30% 黑色

// 边框
const activeBorder = RGBA.fromHex("#7aa2f7")
const inactiveBorder = RGBA.fromInts(65, 72, 104, 255)
```

### parseColor 工具函数

```typescript
// 接受多种格式
parseColor("#FF0000")             // 十六进制字符串
parseColor("red")                 // CSS 颜色名称
parseColor("transparent")         // 特殊值
parseColor(RGBA.fromHex("#F00"))  // 传递 RGBA 对象
```

### 何时使用每个方法

| 方法 | 使用场景 |
|--------|----------|
| `fromHex()` | 使用设计规范、CSS 颜色、配置文件时 |
| `fromInts()` | 有 8 位值（0-255），常见于图形编程 |
| `fromValues()` | 进行颜色插值、动画、数学运算 |
| `parseColor()` | 接受可能是任何格式的用户输入或配置 |

### 在 React/Solid 中使用 RGBA

```tsx
// 从 @opentui/core 导入，在任何框架中使用
import { RGBA } from "@opentui/core"

// React 或 Solid 组件
function ThemedBox() {
  const bg = RGBA.fromHex("#1a1a2e")
  const border = RGBA.fromInts(122, 162, 247, 255)

  return (
    <box backgroundColor={bg} borderColor={border} border>
      <text fg={RGBA.fromHex("#c0caf5")}>Works everywhere!</text>
    </box>
  )
}
```

React/Solid 中的颜色属性接受字符串格式（`"#FF0000"`、`"red"`）和 `RGBA` 对象。

## 键盘输入

```typescript
import { type KeyEvent } from "@opentui/core"

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  console.log(key.name)           // "a", "escape", "f1" 等
  console.log(key.sequence)       // 原始转义序列
  console.log(key.ctrl)           // 按住 Ctrl
  console.log(key.shift)          // 按住 Shift
  console.log(key.meta)           // 按住 Alt
  console.log(key.option)         // 按住 Option（macOS）
  console.log(key.eventType)      // "press" | "release" | "repeat"
})

renderer.keyInput.on("paste", (text: string) => {
  console.log("Pasted:", text)
})
```

## 动画时间轴

```typescript
import { Timeline, engine } from "@opentui/core"

const timeline = new Timeline({
  duration: 2000,
  loop: false,
  autoplay: true,
})

timeline.add(
  { width: 0 },
  {
    width: 50,
    duration: 1000,
    ease: "easeOutQuad",
    onUpdate: (anim) => {
      box.setWidth(anim.targets[0].width)
    },
  },
)

engine.attach(renderer)
engine.addTimeline(timeline)
```

## 类型导出

```typescript
import type {
  CliRenderer,
  CliRendererConfig,
  RenderContext,
  KeyEvent,
  Renderable,
  // ... 以及更多
} from "@opentui/core"
```
