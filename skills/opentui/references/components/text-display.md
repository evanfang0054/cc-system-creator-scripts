# 文本与显示组件

用于在 OpenTUI 中显示文本内容的组件。

## Text 组件

用于显示样式文本的主要组件。

### 基本用法

```tsx
// React/Solid
<text>Hello, World!</text>

// With content prop
<text content="Hello, World!" />

// Core
const text = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, World!",
})
```

### 样式设置（React/Solid）

对于 React 和 Solid，使用**嵌套修饰标签**进行文本样式设置：

```tsx
<text fg="#FFFFFF" bg="#000000">
  <strong>Bold</strong>, <em>italic</em>, and <u>underlined</u>
</text>
```

> **重要**：不要将 `bold`、`italic`、`underline`、`dim`、`strikethrough` 作为 `<text>` 的属性使用 — 它们不起作用。始终使用嵌套标签如 `<strong>`、`<em>`、`<u>` 或带样式的 `<span>`。

### 样式设置（Core）- 文本属性

```typescript
import { TextRenderable, TextAttributes } from "@opentui/core"

const text = new TextRenderable(renderer, {
  content: "Styled",
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
})
```

**可用属性：**
- `TextAttributes.BOLD`
- `TextAttributes.DIM`
- `TextAttributes.ITALIC`
- `TextAttributes.UNDERLINE`
- `TextAttributes.BLINK`
- `TextAttributes.INVERSE`
- `TextAttributes.HIDDEN`
- `TextAttributes.STRIKETHROUGH`

### 文本选择

```tsx
<text selectable>
  This text can be selected by the user
</text>

<text selectable={false}>
  This text cannot be selected
</text>
```

## 文本修饰符

必须用于 `<text>` 内部的内联样式元素：

### Span

内联样式文本：

```tsx
<text>
  普通文本，内联 <span fg="red">红色文本</span>
</text>
```

### 粗体/Strong

```tsx
<text>
  <strong>粗体文本</strong>
  <b>也是粗体</b>
</text>
```

### 斜体/强调

```tsx
<text>
  <em>斜体文本</em>
  <i>也是斜体</i>
</text>
```

### 下划线

```tsx
<text>
  <u>带下划线的文本</u>
</text>
```

### 换行

```tsx
<text>
  第一行
  <br />
  第二行
</text>
```

### 链接

```tsx
<text>
  访问 <a href="https://example.com">我们的网站</a>
</text>
```

### 组合修饰符

```tsx
<text>
  <span fg="#00FF00">
    <strong>粗体绿色</strong>
  </span>
  和
  <span fg="#FF0000">
    <em><u>斜体下划线红色</u></em>
  </span>
</text>
```

## 样式文本模板（Core）

用于复杂样式设置的 `t` 模板字符串：

```typescript
import { t, bold, italic, underline, fg, bg, dim } from "@opentui/core"

const styled = t`
  ${bold("粗体")} 和 ${italic("斜体")} 文本。
  ${fg("#FF0000")("红色文本")} 带有 ${bg("#0000FF")("蓝色背景")}。
  ${dim("变暗")} 和 ${underline("下划线")}。
`

const text = new TextRenderable(renderer, {
  content: styled,
})
```

### 样式函数

| 函数 | 描述 |
|----------|-------------|
| `bold(text)` | 粗体文本 |
| `italic(text)` | 斜体文本 |
| `underline(text)` | 下划线文本 |
| `dim(text)` | 变暗文本 |
| `strikethrough(text)` | 删除线文本 |
| `fg(color)(text)` | 设置前景色 |
| `bg(color)(text)` | 设置背景色 |

## ASCII Font 组件

显示大型 ASCII 艺术文本横幅。

### 基本用法

```tsx
// React
<ascii-font text="TITLE" font="tiny" />

// Solid
<ascii_font text="TITLE" font="tiny" />

// Core
const title = new ASCIIFontRenderable(renderer, {
  id: "title",
  text: "TITLE",
  font: "tiny",
})
```

### 可用字体

| 字体 | 描述 |
|------|-------------|
| `tiny` | 紧凑的 ASCII 字体 |
| `block` | 块状字母 |
| `slick` | 时尚的现代风格 |
| `shade` | 阴影 3D 效果 |

### 样式设置

```tsx
// React
<ascii-font
  text="HELLO"
  font="block"
  color="#00FF00"
/>

// Core
import { RGBA } from "@opentui/core"

const title = new ASCIIFontRenderable(renderer, {
  text: "HELLO",
  font: "block",
  color: RGBA.fromHex("#00FF00"),
})
```

### 输出示例

```
Font: tiny
╭─╮╭─╮╭─╮╭╮╭╮╭─╮╶╮╶ ╶╮
│ ││─┘├┤ │╰╯││  │  │
╰─╯╵  ╰─╯╵  ╵╰─╯╶╯╶╰─╯

Font: block
█▀▀█ █▀▀█ █▀▀ █▀▀▄
█  █ █▀▀▀ █▀▀ █  █
▀▀▀▀ ▀    ▀▀▀ ▀  ▀
```

## 颜色

### 颜色格式

```tsx
// 十六进制颜色
<text fg="#FF0000">红色</text>
<text fg="#F00">短十六进制</text>

// 命名颜色
<text fg="red">红色</text>
<text fg="blue">蓝色</text>

// 透明
<text bg="transparent">无背景</text>
```

### RGBA 类

来自 `@opentui/core` 的 `RGBA` 类可在**所有框架**（Core、React、Solid）中用于程序化颜色操作：

```typescript
import { RGBA } from "@opentui/core"

// From hex string (most common)
const red = RGBA.fromHex("#FF0000")
const shortHex = RGBA.fromHex("#F00")       // Short form supported

// From integers (0-255 range for each channel)
const green = RGBA.fromInts(0, 255, 0, 255)   // r, g, b, a
const semiGreen = RGBA.fromInts(0, 255, 0, 128) // 50% transparent

// From normalized floats (0.0-1.0 range)
const blue = RGBA.fromValues(0.0, 0.0, 1.0, 1.0)  // r, g, b, a
const overlay = RGBA.fromValues(0.1, 0.1, 0.1, 0.7) // Dark semi-transparent

// Common use cases
const backgroundColor = RGBA.fromHex("#1a1a2e")
const textColor = RGBA.fromHex("#FFFFFF")
const borderColor = RGBA.fromInts(122, 162, 247, 255) // Tokyo Night blue
const shadowColor = RGBA.fromValues(0.0, 0.0, 0.0, 0.5) // 50% black
```

**各方法的使用场景：**
- `fromHex()` - 处理设计规范或 CSS 颜色时使用
- `fromInts()` - 有 8 位颜色值（0-255）时使用
- `fromValues()` - 进行颜色计算或插值时使用（标准化 0.0-1.0）

### 在 React/Solid 中使用 RGBA

```tsx
// React or Solid - RGBA works with color props
import { RGBA } from "@opentui/core"

const primaryColor = RGBA.fromHex("#7aa2f7")

function MyComponent() {
  return (
    <box backgroundColor={primaryColor} borderColor={primaryColor}>
      <text fg={RGBA.fromHex("#c0caf5")}>Styled with RGBA</text>
    </box>
  )
}
```

大多数接受颜色字符串（`"#FF0000"`、`"red"`）的属性也直接接受 `RGBA` 对象。

## 文本换行

文本根据父容器进行换行：

```tsx
<box width={40}>
  <text>
    这段长文本在到达 40 个字符宽的父容器边缘时会
    自动换行。
  </text>
</box>
```

## 动态内容

### React

```tsx
function Counter() {
  const [count, setCount] = useState(0)
  return <text>计数：{count}</text>
}
```

### Solid

```tsx
function Counter() {
  const [count, setCount] = createSignal(0)
  return <text>计数：{count()}</text>
}
```

### Core

```typescript
const text = new TextRenderable(renderer, {
  id: "counter",
  content: "计数：0",
})

// 稍后更新
text.setContent("计数：1")
```

## 注意事项

### 文本修饰符在 Text 外部使用

```tsx
// 错误 - 修饰符只能在 <text> 内部使用
<box>
  <strong>不会工作</strong>
</box>

// 正确
<box>
  <text>
    <strong>这会工作</strong>
  </text>
</box>
```

### 空文本

```tsx
// 可能导致布局问题
<text></text>

// 更好 - 使用空格或条件
<text>{content || " "}</text>
```

### 颜色格式

```tsx
// 错误
<text fg="FF0000">缺少 #</text>

// 正确
<text fg="#FF0000">包含 #</text>
```
