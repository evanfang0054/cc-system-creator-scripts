# OpenTUI 布局系统

OpenTUI 使用 Yoga 布局引擎，提供类似 CSS Flexbox 的功能，用于在终端中定位和调整组件大小。

## 概述

核心概念：
- **Flexbox 模型**：熟悉的 CSS Flexbox 属性
- **Yoga 引擎**：Facebook 的跨平台布局引擎
- **终端单位**：尺寸以字符单元格为单位（列 × 行）
- **百分比支持**：基于父元素的相对大小

## Flex 容器属性

### flexDirection

控制主轴方向：

```tsx
// Row（默认）- 子元素水平流动
<box flexDirection="row">
  <text>1</text>
  <text>2</text>
  <text>3</text>
</box>
// 输出：1 2 3

// Column - 子元素垂直流动
<box flexDirection="column">
  <text>1</text>
  <text>2</text>
  <text>3</text>
</box>
// 输出：
// 1
// 2
// 3

// 反向变体
<box flexDirection="row-reverse">...</box>     // 3 2 1
<box flexDirection="column-reverse">...</box>  // 从下到上
```

### justifyContent

沿主轴对齐子元素：

```tsx
<box flexDirection="row" width={40} justifyContent="flex-start">
  {/* 子元素在开始位置（对于 row 来说是左侧） */}
</box>

<box flexDirection="row" width={40} justifyContent="flex-end">
  {/* 子元素在结束位置（对于 row 来说是右侧） */}
</box>

<box flexDirection="row" width={40} justifyContent="center">
  {/* 子元素居中 */}
</box>

<box flexDirection="row" width={40} justifyContent="space-between">
  {/* 第一个在开始，最后一个在结束，其余均匀分布 */}
</box>

<box flexDirection="row" width={40} justifyContent="space-around">
  {/* 每个子元素周围有相等的空间 */}
</box>

<box flexDirection="row" width={40} justifyContent="space-evenly">
  {/* 所有子元素和边缘之间有相等的空间 */}
</box>
```

### alignItems

沿交叉轴对齐子元素：

```tsx
<box flexDirection="row" height={10} alignItems="flex-start">
  {/* 子元素在顶部 */}
</box>

<box flexDirection="row" height={10} alignItems="flex-end">
  {/* 子元素在底部 */}
</box>

<box flexDirection="row" height={10} alignItems="center">
  {/* 子元素垂直居中 */}
</box>

<box flexDirection="row" height={10} alignItems="stretch">
  {/* 子元素拉伸以填充高度 */}
</box>

<box flexDirection="row" height={10} alignItems="baseline">
  {/* 子元素按文本基线对齐 */}
</box>
```

### flexWrap

控制子元素是否换行：

```tsx
<box flexDirection="row" flexWrap="nowrap" width={20}>
  {/* 子元素溢出（默认） */}
</box>

<box flexDirection="row" flexWrap="wrap" width={20}>
  {/* 子元素换到下一行 */}
</box>

<box flexDirection="row" flexWrap="wrap-reverse" width={20}>
  {/* 子元素向上换行 */}
</box>
```

### gap

子元素之间的间距：

```tsx
<box flexDirection="row" gap={2}>
  <text>A</text>
  <text>B</text>
  <text>C</text>
</box>
// 输出：A  B  C（之间有 2 个空格）
```

## Flex 子元素属性

### flexGrow

子元素相对于兄弟元素的增长程度：

```tsx
<box flexDirection="row" width={30}>
  <box flexGrow={1}><text>1</text></box>
  <box flexGrow={2}><text>2</text></box>
  <box flexGrow={1}><text>1</text></box>
</box>
// 宽度：7.5 | 15 | 7.5（1:2:1 比例）
```

### flexShrink

当空间受限时子元素的收缩程度：

```tsx
<box flexDirection="row" width={20}>
  <box width={15} flexShrink={1}><text>可收缩</text></box>
  <box width={15} flexShrink={0}><text>固定</text></box>
</box>
```

### flexBasis

在增长/收缩之前的初始大小：

```tsx
<box flexDirection="row">
  <box flexBasis={20} flexGrow={1}>从 20 开始，可以增长</box>
  <box flexBasis="50%">父元素的一半</box>
</box>
```

### alignSelf

为该子元素覆盖父元素的 alignItems：

```tsx
<box flexDirection="row" height={10} alignItems="center">
  <text>居中</text>
  <text alignSelf="flex-start">顶部</text>
  <text alignSelf="flex-end">底部</text>
</box>
```

## 尺寸

### 固定尺寸

```tsx
<box width={40} height={10}>
  {/* 正好 40 列 × 10 行 */}
</box>
```

### 百分比尺寸

父元素必须具有明确的大小：

```tsx
<box width="100%" height="100%">
  <box width="50%" height="50%">
    {/* 父元素的一半 */}
  </box>
</box>
```

### 最小/最大约束

```tsx
<box
  minWidth={20}
  maxWidth={60}
  minHeight={5}
  maxHeight={20}
>
  {/* 受约束的尺寸 */}
</box>
```

## 间距

### Padding（内边距）

```tsx
// 所有边
<box padding={2}>内容</box>

// 单独的边
<box
  paddingTop={1}
  paddingRight={2}
  paddingBottom={1}
  paddingLeft={2}
>
  内容
</box>
```

### Margin（外边距）

```tsx
// 所有边
<box margin={1}>内容</box>

// 单独的边
<box
  marginTop={1}
  marginRight={2}
  marginBottom={1}
  marginLeft={2}
>
  内容
</box>
```

## 定位

### Relative（默认）

元素按正常文档顺序流动：

```tsx
<box position="relative">
  {/* 正常流动 */}
</box>
```

### Absolute

元素相对于最近的已定位祖先元素定位：

```tsx
<box position="relative" width="100%" height="100%">
  <box
    position="absolute"
    left={10}
    top={5}
    width={20}
    height={5}
  >
    定位在 (10, 5)
  </box>
</box>
```

### 定位属性

```tsx
<box
  position="absolute"
  left={10}      // 距离左边缘
  top={5}        // 距离上边缘
  right={10}     // 距离右边缘
  bottom={5}     // 距离下边缘
>
  内容
</box>
```

## 显示

### 可见性控制

```tsx
// 可见（默认）
<box display="flex">可见</box>

// 隐藏（从布局中移除）
<box display="none">隐藏</box>
```

## 溢出

```tsx
<box overflow="visible">
  {/* 内容可以超出边界（默认） */}
</box>

<box overflow="hidden">
  {/* 内容在边界处被裁剪 */}
</box>

<box overflow="scroll">
  {/* 当内容超出边界时可滚动 */}
</box>
```

## Z-Index

控制重叠元素的堆叠顺序：

```tsx
<box position="relative">
  <box position="absolute" zIndex={1}>在后面</box>
  <box position="absolute" zIndex={2}>在前面</box>
</box>
```

## 另请参阅

- [布局模式](./patterns.md) - 常见的布局方案
- [组件/容器](../components/containers.md) - Box 和 ScrollBox 详细信息
