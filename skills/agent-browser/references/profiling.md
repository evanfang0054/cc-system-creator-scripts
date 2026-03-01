# 性能分析

在浏览器自动化过程中捕获 Chrome DevTools 性能配置文件，用于性能分析。

**相关文档**: [commands.md](commands.md) 完整命令参考，[SKILL.md](../SKILL.md) 快速入门。

## 目录

- [基础性能分析](#基础性能分析)
- [性能分析器命令](#性能分析器命令)
- [分类](#分类)
- [使用场景](#使用场景)
- [输出格式](#输出格式)
- [查看性能配置文件](#查看性能配置文件)
- [限制](#限制)

## 基础性能分析

```bash
# 启动性能分析
agent-browser profiler start

# 执行操作
agent-browser navigate https://example.com
agent-browser click "#button"
agent-browser wait 1000

# 停止并保存
agent-browser profiler stop ./trace.json
```

## 性能分析器命令

```bash
# 使用默认分类启动性能分析
agent-browser profiler start

# 使用自定义跟踪分类启动
agent-browser profiler start --categories "devtools.timeline,v8.execute,blink.user_timing"

# 停止性能分析并保存到文件
agent-browser profiler stop ./trace.json
```

## 分类

`--categories` 标志接受逗号分隔的 Chrome 跟踪分类列表。默认分类包括：

- `devtools.timeline` -- 标准 DevTools 性能跟踪
- `v8.execute` -- JavaScript 执行时间
- `blink` -- 渲染器事件
- `blink.user_timing` -- `performance.mark()` / `performance.measure()` 调用
- `latencyInfo` -- 输入延迟跟踪
- `renderer.scheduler` -- 任务调度和执行
- `toplevel` -- 广泛的基础事件

还包括多个 `disabled-by-default-*` 分类，用于详细的 timeline、调用堆栈和 V8 CPU 性能分析数据。

## 使用场景

### 诊断页面加载缓慢

```bash
agent-browser profiler start
agent-browser navigate https://app.example.com
agent-browser wait --load networkidle
agent-browser profiler stop ./page-load-profile.json
```

### 分析用户交互性能

```bash
agent-browser navigate https://app.example.com
agent-browser profiler start
agent-browser click "#submit"
agent-browser wait 2000
agent-browser profiler stop ./interaction-profile.json
```

### CI 性能回归检查

```bash
#!/bin/bash
agent-browser profiler start
agent-browser navigate https://app.example.com
agent-browser wait --load networkidle
agent-browser profiler stop "./profiles/build-${BUILD_ID}.json"
```

## 输出格式

输出为 Chrome Trace Event 格式的 JSON 文件：

```json
{
  "traceEvents": [
    { "cat": "devtools.timeline", "name": "RunTask", "ph": "X", "ts": 12345, "dur": 100, ... },
    ...
  ],
  "metadata": {
    "clock-domain": "LINUX_CLOCK_MONOTONIC"
  }
}
```

`metadata.clock-domain` 字段根据主机平台设置（Linux 或 macOS）。在 Windows 上此字段被省略。

## 查看性能配置文件

将输出的 JSON 文件加载到以下任一工具中：

- **Chrome DevTools**: Performance 面板 > Load profile (Ctrl+Shift+I > Performance)
- **Perfetto UI**: https://ui.perfetto.dev/ -- 拖放 JSON 文件
- **Trace Viewer**: 任何 Chromium 浏览器中的 `chrome://tracing`

## 限制

- 仅适用于基于 Chromium 的浏览器（Chrome、Edge）。不支持 Firefox 或 WebKit。
- 性能分析处于活动状态时，跟踪数据会在内存中累积（上限为 500 万个事件）。在关注区域结束后应及时停止性能分析。
- 停止时的数据收集有 30 秒超时限制。如果浏览器无响应，停止命令可能会失败。
