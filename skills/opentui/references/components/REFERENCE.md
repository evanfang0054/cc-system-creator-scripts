# OpenTUI 组件

所有 OpenTUI 组件的参考文档，按类别组织。组件在所有三个框架（Core、React、Solid）中都可用，API 略有差异。

## 何时使用

当您需要找到合适的组件类别或比较 Core、React 和 Solid 之间的命名时，请使用此参考文档。

## 组件类别

| 类别 | 组件 | 文件 |
|----------|------------|------|
| 文本与显示 | text, ascii-font, styled text | [text-display.md](./text-display.md) |
| 容器 | box, scrollbox, borders | [containers.md](./containers.md) |
| 输入 | input, textarea, select, tab-select | [inputs.md](./inputs.md) |
| 代码与差异 | code, line-number, diff | [code-diff.md](./code-diff.md) |

## 组件选择器

```
需要组件？
├─ 样式文本或 ASCII 艺术字 -> text-display.md
├─ 容器、边框、滚动 -> containers.md
├─ 表单或输入控件 -> inputs.md
└─ 代码块、差异、行号 -> code-diff.md
```

## 组件命名

组件在不同框架中有不同的名称：

| 概念 | Core (类) | React (JSX) | Solid (JSX) |
|---------|--------------|-------------|-------------|
| Text | `TextRenderable` | `<text>` | `<text>` |
| Box | `BoxRenderable` | `<box>` | `<box>` |
| ScrollBox | `ScrollBoxRenderable` | `<scrollbox>` | `<scrollbox>` |
| Input | `InputRenderable` | `<input>` | `<input>` |
| Textarea | `TextareaRenderable` | `<textarea>` | `<textarea>` |
| Select | `SelectRenderable` | `<select>` | `<select>` |
| Tab Select | `TabSelectRenderable` | `<tab-select>` | `<tab_select>` |
| ASCII Font | `ASCIIFontRenderable` | `<ascii-font>` | `<ascii_font>` |
| Code | `CodeRenderable` | `<code>` | `<code>` |
| Line Number | `LineNumberRenderable` | `<line-number>` | `<line_number>` |
| Diff | `DiffRenderable` | `<diff>` | `<diff>` |

**注意**：Solid 使用下划线（`tab_select`），而 React 使用连字符（`tab-select`）。

## 通用属性

所有组件都共享这些布局属性（参见 [Layout](../layout/REFERENCE.md)）：

```tsx
// Positioning
position="relative" | "absolute"
left, top, right, bottom

// Dimensions
width, height
minWidth, maxWidth, minHeight, maxHeight

// Flexbox
flexDirection, flexGrow, flexShrink, flexBasis
justifyContent, alignItems, alignSelf
flexWrap, gap

// Spacing
padding, paddingTop, paddingRight, paddingBottom, paddingLeft
margin, marginTop, marginRight, marginBottom, marginLeft

// Display
display="flex" | "none"
overflow="visible" | "hidden" | "scroll"
zIndex
```

## 快速示例

### Core（命令式）

```typescript
import { createCliRenderer, TextRenderable, BoxRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const box = new BoxRenderable(renderer, {
  id: "container",
  border: true,
  padding: 2,
})

const text = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello!",
  fg: "#00FF00",
})

box.add(text)
renderer.root.add(box)
```

### React

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

function App() {
  return (
    <box border padding={2}>
      <text fg="#00FF00">Hello!</text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

### Solid

```tsx
import { render } from "@opentui/solid"

function App() {
  return (
    <box border padding={2}>
      <text fg="#00FF00">Hello!</text>
    </box>
  )
}

render(() => <App />)
```

## 另请参阅

- [Core API](../core/api.md) - 命令式组件类
- [React API](../react/api.md) - React 组件属性
- [Solid API](../solid/api.md) - Solid 组件属性
- [Layout](../layout/REFERENCE.md) - 布局系统详情
