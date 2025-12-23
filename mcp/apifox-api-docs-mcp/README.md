# Apifox API 文档 MCP 服务器

一个简洁、高效的 MCP (Model Context Protocol) 服务器，用于获取 Apifox API 文档。

## ✨ 功能特性

- 🔑 **灵活的认证方式** - 支持环境变量和直接参数传递
- 🔄 **自动重试机制** - 指数退避重试策略，提升请求可靠性
- ⏱️ **超时控制** - 可配置的请求超时时间
- ✅ **参数验证** - 使用 Zod 进行运行时类型检查
- 🛡️ **错误处理** - 中文化的错误提示和建议
- 📦 **零配置启动** - MCP 客户端模式下自动读取环境变量

## 🚀 快速开始

### 1. 安装

```bash
# 进入项目目录
cd apifox-api-docs-mcp

# 安装依赖
pnpm install
```

### 2. 配置

创建 `.env` 文件（可选）：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Apifox API 配置
APIFOX_BASE_URL=https://your-apifox-instance.com
APIFOX_API_KEY=your-instance-key

# 请求配置（可选）
APIFOX_TIMEOUT=10000
APIFOX_RETRIES=2
```

### 3. 构建

```bash
pnpm build
```

### 4. 在 Claude Code 中使用

#### 方式一：配置文件（推荐）

在 `.claude/mcp.json` 或 Claude Desktop 配置中添加：

```json
{
  "mcpServers": {
    "apifox-api-docs-mcp": {
      "command": "npx",
      "args": ["-y", "apifox-api-docs-mcp"],
      "env": {
        "APIFOX_API_KEY": "your-instance-key",
        "APIFOX_BASE_URL": "https://your-apifox-instance.com"
      }
    }
  }
}
```

#### 方式二：命令行

```bash
claude mcp add apifox-api-docs node /path/to/apifox-api-docs-mcp/dist/index.js \
  --env APIFOX_API_KEY=your-key-here \
  --env APIFOX_BASE_URL=https://your-instance.com
```

## 📖 可用工具

### 1. `get_api_list` - 获取 API 接口列表

获取完整的 Apifox API 文档内容。

**参数：**
- `input` (string, 可选): Apifox 文档的 URL 或 UUID Key
  - UUID 格式：`00000000-0000-0000-0000-000000000000`
  - 完整 URL：`https://domain.com/apidoc/shared/{UUID}`
- `timeout` (number, 可选): 请求超时时间（毫秒，1000-60000，默认 10000）
- `retries` (number, 可选): 重试次数（0-5，默认 2）

**返回：**
完整的 API 文档文本内容

### 2. `get_api_detail` - 获取 API 详细信息

获取指定 API 接口的详细文档。

**参数：**
- `key` (string, 可选): Apifox 文档的 Key
- `apiId` (string, 必需): API 接口的 ID
- `timeout` (number, 可选): 请求超时时间（毫秒，1000-60000，默认 10000）
- `retries` (number, 可选): 重试次数（0-5，默认 2）

**返回：**
指定 API 的详细文档内容

### 3. `health_check` - 健康检查

检查服务器状态和配置。

**返回：**
- 服务器版本
- 基础 URL
- API Key 配置状态
- 可用工具数量

## 🎯 使用示例

### 示例 1：获取 API 列表（使用环境变量）

```
请使用 get_api_list 工具获取 Apifox API 接口列表
```

### 示例 2：获取 API 列表（提供参数）

```
请使用 get_api_list 工具获取以下文档的接口列表：
99e805b6-d781-40bf-aad5-f8e1151ea228
```

### 示例 3：获取 API 详情

```
请使用 get_api_detail 工具获取这个 API 的详细信息：
apiId: getUserList
```

## 📝 环境变量

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `APIFOX_API_KEY` | ❌ | - | Apifox 文档的 UUID Key（可通过参数传递） |
| `APIFOX_BASE_URL` | ❌ | `https://apifox.evanfang.com.cn` | Apifox 服务器地址 |
| `APIFOX_TIMEOUT` | ❌ | `10000` | 请求超时时间（毫秒） |
| `APIFOX_RETRIES` | ❌ | `2` | 重试次数 |
| `NODE_ENV` | ❌ | `production` | 运行环境（development/production） |

## 🔧 开发命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发模式（热重载）
pnpm dev

# 启动 MCP Inspector（调试）
pnpm debug:apifox
```

## 📁 项目结构

```
apifox-api-docs-mcp/
├── src/
│   ├── index.ts           # MCP 服务器入口
│   ├── apifox-client.ts   # Apifox API 客户端
│   ├── errors.ts         # 错误处理
│   └── types.ts          # 类型定义
├── dist/                  # 构建输出
├── .env.example          # 环境变量示例
├── package.json          # 项目配置
└── README.md             # 项目说明
```

## 🎨 设计原则

本项目遵循 **KISS (Keep It Simple, Stupid)** 原则：

- ✅ **简单** - 代码精简，易于理解
- ✅ **直接** - 避免过度抽象
- ✅ **高效** - 只实现必要功能
- ✅ **可维护** - 清晰的代码结构

## 🛠️ 技术栈

- **TypeScript** - 类型安全的开发体验
- **Node.js** - 运行时环境
- **MCP SDK** - Model Context Protocol 官方 SDK
- **Zod** - 运行时参数验证

## 📄 许可证

MIT
