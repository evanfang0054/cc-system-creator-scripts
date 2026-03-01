# 快照和引用

精简的元素引用，可大幅减少 AI 代理的上下文使用量。

**相关文档**：完整命令参考请参阅 [commands.md](commands.md)，快速入门请参阅 [SKILL.md](../SKILL.md)。

## 目录

- [引用的工作原理](#引用的工作原理)
- [快照命令](#快照命令)
- [使用引用](#使用引用)
- [引用的生命周期](#引用的生命周期)
- [最佳实践](#最佳实践)
- [引用表示法详解](#引用表示法详解)
- [故障排除](#故障排除)

## 引用的工作原理

传统方法：
```
完整 DOM/HTML → AI 解析 → CSS 选择器 → 操作（约 3000-5000 tokens）
```

agent-browser 方法：
```
精简快照 → 分配 @refs → 直接交互（约 200-400 tokens）
```

## 快照命令

```bash
# 基本快照（显示页面结构）
agent-browser snapshot

# 交互式快照（-i 标志）- 推荐
agent-browser snapshot -i
```

### 快照输出格式

```
Page: Example Site - Home
URL: https://example.com

@e1 [header]
  @e2 [nav]
    @e3 [a] "Home"
    @e4 [a] "Products"
    @e5 [a] "About"
  @e6 [button] "Sign In"

@e7 [main]
  @e8 [h1] "Welcome"
  @e9 [form]
    @e10 [input type="email"] placeholder="Email"
    @e11 [input type="password"] placeholder="Password"
    @e12 [button type="submit"] "Log In"

@e13 [footer]
  @e14 [a] "Privacy Policy"
```

## 使用引用

获取引用后，即可直接进行交互：

```bash
# 点击 "Sign In" 按钮
agent-browser click @e6

# 填写邮箱输入框
agent-browser fill @e10 "user@example.com"

# 填写密码
agent-browser fill @e11 "password123"

# 提交表单
agent-browser click @e12
```

## 引用的生命周期

**重要提示**：当页面发生变化时，引用会失效！

```bash
# 获取初始快照
agent-browser snapshot -i
# @e1 [button] "Next"

# 点击触发页面变化
agent-browser click @e1

# 必须重新获取快照以获取新的引用！
agent-browser snapshot -i
# @e1 [h1] "Page 2"  ← 现在是不同的元素了！
```

## 最佳实践

### 1. 交互前始终先获取快照

```bash
# 正确做法
agent-browser open https://example.com
agent-browser snapshot -i          # 先获取引用
agent-browser click @e1            # 使用引用

# 错误做法
agent-browser open https://example.com
agent-browser click @e1            # 引用还不存在！
```

### 2. 页面导航后重新获取快照

```bash
agent-browser click @e5            # 导航到新页面
agent-browser snapshot -i          # 获取新的引用
agent-browser click @e1            # 使用新的引用
```

### 3. 动态变化后重新获取快照

```bash
agent-browser click @e1            # 打开下拉菜单
agent-browser snapshot -i          # 查看下拉菜单项
agent-browser click @e7            # 选择项目
```

### 4. 对特定区域获取快照

对于复杂页面，可以只对特定区域获取快照：

```bash
# 仅对表单区域获取快照
agent-browser snapshot @e9
```

## 引用表示法详解

```
@e1 [tag type="value"] "text content" placeholder="hint"
│    │   │             │               │
│    │   │             │               └─ 附加属性
│    │   │             └─ 可见文本
│    │   └─ 显示的关键属性
│    └─ HTML 标签名
└─ 唯一引用 ID
```

### 常见模式

```
@e1 [button] "Submit"                    # 带文本的按钮
@e2 [input type="email"]                 # 邮箱输入框
@e3 [input type="password"]              # 密码输入框
@e4 [a href="/page"] "Link Text"         # 锚点链接
@e5 [select]                             # 下拉选择框
@e6 [textarea] placeholder="Message"     # 文本域
@e7 [div class="modal"]                  # 容器（相关时显示）
@e8 [img alt="Logo"]                     # 图片
@e9 [checkbox] checked                   # 已选中的复选框
@e10 [radio] selected                    # 已选中的单选按钮
```

## 故障排除

### "Ref not found" 错误

```bash
# 引用可能已变化 - 重新获取快照
agent-browser snapshot -i
```

### 快照中看不到元素

```bash
# 向下滚动以显示元素
agent-browser scroll down 1000
agent-browser snapshot -i

# 或等待动态内容加载
agent-browser wait 1000
agent-browser snapshot -i
```

### 元素过多

```bash
# 对特定容器获取快照
agent-browser snapshot @e5

# 或使用 get text 仅提取文本内容
agent-browser get text @e5
```
