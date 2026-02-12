# 代码与差异组件

用于在 OpenTUI 中显示语法高亮代码和差异的组件。

## Code 组件

显示语法高亮的代码块。

### 基本用法

```tsx
// React
<code
  code={`function hello() {
  console.log("Hello, World!");
}`}
  language="typescript"
/>

// Solid
<code
  code={sourceCode}
  language="javascript"
/>

// Core
const codeBlock = new CodeRenderable(renderer, {
  id: "code",
  code: sourceCode,
  language: "typescript",
})
```

### 支持的语言

OpenTUI 使用 Tree-sitter 进行语法高亮。常用语言：
- `typescript`, `javascript`
- `python`
- `rust`
- `go`
- `json`
- `html`, `css`
- `markdown`
- `bash`, `shell`

### 样式设置

```tsx
<code
  code={sourceCode}
  language="typescript"
  backgroundColor="#1a1a2e"
  showLineNumbers
/>
```

## Line Number 组件

带行号、高亮和诊断信息的代码显示。

### 基本用法

```tsx
// React
<line-number
  code={sourceCode}
  language="typescript"
/>

// Solid (note underscore)
<line_number
  code={sourceCode}
  language="typescript"
/>

// Core
const codeView = new LineNumberRenderable(renderer, {
  id: "code-view",
  code: sourceCode,
  language: "typescript",
})
```

### 行号选项

```tsx
// React
<line-number
  code={sourceCode}
  language="typescript"
  startLine={1}              // Starting line number
  showLineNumbers={true}     // Display line numbers
/>

// Solid
<line_number
  code={sourceCode}
  language="typescript"
  startLine={1}
  showLineNumbers={true}
/>
```

### 行高亮

高亮特定行：

```tsx
// React
<line-number
  code={sourceCode}
  language="typescript"
  highlightedLines={[5, 10, 15]}  // Highlight these lines
/>

// Solid
<line_number
  code={sourceCode}
  language="typescript"
  highlightedLines={[5, 10, 15]}
/>
```

### 诊断信息

在特定行显示错误、警告和信息：

```tsx
// React
<line-number
  code={sourceCode}
  language="typescript"
  diagnostics={[
    { line: 3, severity: "error", message: "Unexpected token" },
    { line: 7, severity: "warning", message: "Unused variable" },
    { line: 12, severity: "info", message: "Consider using const" },
  ]}
/>

// Solid
<line_number
  code={sourceCode}
  language="typescript"
  diagnostics={[
    { line: 3, severity: "error", message: "Unexpected token" },
  ]}
/>
```

**诊断严重性级别：**
- `error` - 红色指示器
- `warning` - 黄色指示器
- `info` - 蓝色指示器
- `hint` - 灰色指示器

### 差异高亮

显示已添加/删除的行：

```tsx
<line-number
  code={sourceCode}
  language="typescript"
  addedLines={[5, 6, 7]}      // Green background
  removedLines={[10, 11]}     // Red background
/>
```

## Diff 组件

统一或分屏的差异查看器，支持语法高亮。

### 基本用法

```tsx
// React
<diff
  oldCode={originalCode}
  newCode={modifiedCode}
  language="typescript"
/>

// Solid
<diff
  oldCode={originalCode}
  newCode={modifiedCode}
  language="typescript"
/>

// Core
const diffView = new DiffRenderable(renderer, {
  id: "diff",
  oldCode: originalCode,
  newCode: modifiedCode,
  language: "typescript",
})
```

### 显示模式

```tsx
// Unified diff (default)
<diff
  oldCode={old}
  newCode={new}
  mode="unified"
/>

// Split/side-by-side diff
<diff
  oldCode={old}
  newCode={new}
  mode="split"
/>
```

### 选项

```tsx
<diff
  oldCode={originalCode}
  newCode={modifiedCode}
  language="typescript"
  mode="unified"
  showLineNumbers
  context={3}                // Lines of context around changes
/>
```

### 样式设置

```tsx
<diff
  oldCode={old}
  newCode={new}
  addedLineColor="#2d4f2d"   // Background for added lines
  removedLineColor="#4f2d2d" // Background for removed lines
  unchangedLineColor="transparent"
/>
```

## 使用场景

### 代码编辑器

```tsx
function CodeEditor() {
  const [code, setCode] = useState(`function hello() {
  console.log("Hello!");
}`)
  
  return (
    <box flexDirection="column" height="100%">
      <box height={1}>
        <text>editor.ts</text>
      </box>
      <textarea
        value={code}
        onChange={setCode}
        language="typescript"
        showLineNumbers
        flexGrow={1}
        focused
      />
    </box>
  )
}
```

### 代码审查

```tsx
function CodeReview({ oldCode, newCode }) {
  return (
    <box flexDirection="column" height="100%">
      <box height={1} backgroundColor="#333">
        <text>Changes in src/utils.ts</text>
      </box>
      <diff
        oldCode={oldCode}
        newCode={newCode}
        language="typescript"
        mode="split"
        showLineNumbers
      />
    </box>
  )
}
```

### 语法高亮预览

```tsx
function MarkdownPreview({ content }) {
  // Extract code blocks from markdown
  const codeBlocks = extractCodeBlocks(content)
  
  return (
    <scrollbox height={20}>
      {codeBlocks.map((block, i) => (
        <box key={i} marginBottom={1}>
          <code
            code={block.code}
            language={block.language}
          />
        </box>
      ))}
    </scrollbox>
  )
}
```

### 错误显示

```tsx
function ErrorView({ errors, code }) {
  const diagnostics = errors.map(err => ({
    line: err.line,
    severity: "error",
    message: err.message,
  }))
  
  return (
    <line-number
      code={code}
      language="typescript"
      diagnostics={diagnostics}
      highlightedLines={errors.map(e => e.line)}
    />
  )
}
```

## 注意事项

### Solid 使用下划线

```tsx
// React
<line-number />

// Solid
<line_number />
```

### 语法高亮需要指定语言

```tsx
// 无高亮（纯文本）
<code code={text} />

// 带高亮
<code code={text} language="typescript" />
```

### 大文件处理

对于非常大的文件，建议：
- 使用分页或虚拟滚动
- 仅加载可见部分
- 使用 `scrollbox` 包装器

```tsx
<scrollbox height={30}>
  <line-number
    code={largeFile}
    language="typescript"
  />
</scrollbox>
```

### Tree-sitter 加载

语法高亮需要 Tree-sitter 语法。如果高亮不工作：

1. 检查语言是否受支持
2. 验证语法是否已安装
3. 如果使用自定义路径，检查 `OTUI_TREE_SITTER_WORKER_PATH`
