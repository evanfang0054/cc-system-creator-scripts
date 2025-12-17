# Apifox API Docs MCP Server

一个专门用于获取 Apifox API 文档的 MCP (Model Context Protocol) 服务器。

## 功能

该 MCP 服务器提供两个主要工具：

### 1. `get_api_list`
获取完整的 Apifox API 文档内容

**输入参数：**
- `input`: Apifox API 文档的 URL 或直接的 Key (可选)
  - URL 示例：`https://apifox.dragonpass.com.cn/apidoc/shared/99e805b6-d781-40bf-aad5-f8e1151ea228/api-3525338`
  - Key 示例：`99e805b6-d781-40bf-aad5-f8e1151ea228`

**输出：**
返回完整的 API 文档原始内容，让 AI 直接分析文档结构和可用的接口

### 2. `get_api_detail`
获取特定 API 接口的详细文档

**输入参数：**
- `key`: Apifox API 文档的 Key (可选，可通过环境变量配置)
- `apiId`: API 接口的 ID 或标识符（必须是从 get_api_list 返回文档中存在的具体 API）

**输出：**
返回指定 API 接口的详细文档内容（已自动清理 HTML 标签，提取纯文本）

**关于 `apiId` 格式：**
- 可以是文档中显示的任何 API 标识符
- 常见格式：`api-123456`、`#123456`、接口编号等
- 具体格式取决于 Apifox 文档的显示方式

## 环境变量配置

### 使用 .env 文件（推荐）

项目使用 `dotenv` 来管理环境变量。创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，设置你的 API Key
APIFOX_API_KEY=99e805b6-d781-40bf-aad5-f8e1151ea228
```

### 获取 APIFOX_API_KEY

1. 访问你的 Apifox 项目
2. 进入项目设置 → API 文档 → 分享
3. 复制分享链接中的 key（格式：`shared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/` 中的UUID部分）
4. 将 UUID 设置到 `.env` 文件中

**示例链接格式：**
```
https://apifox.dragonpass.com.cn/apidoc/shared/99e805b6-d781-40bf-aad5-f8e1151ea228/api-3525338
```
其中 `99e805b6-d781-40bf-aad5-f8e1151ea228` 就是要使用的 APIFOX_API_KEY

### 配置效果

**配置 .env 文件后：**
- ✅ `input` 和 `key` 参数变为可选
- ✅ 工具会自动从环境变量读取 API Key 和基础 URL
- ✅ 支持自定义 Apifox 实例（通过 APIFOX_BASE_URL）
- ✅ 仍可以手动提供参数覆盖环境变量
- ✅ 更安全的配置管理（.env 文件不会被提交到 git）

**优先级：** 手动提供的参数 > 环境变量

### 自定义 Apifox 实例

如果你使用自己的 Apifox 实例或私有部署，可以通过环境变量进行配置：

```bash
# 编辑 .env 文件
APIFOX_BASE_URL=https://your-apifox-instance.com
APIFOX_API_KEY=your-instance-key
```

**支持的实例类型：**
- ✅ Apifox Cloud（默认）
- ✅ 私有部署实例
- ✅ 企业版实例
- ✅ 任何兼容 Apifox API 的服务

## 工作流程

### 🔑 重要规则

**必须先调用 `get_api_list` 才能使用 `get_api_detail`**

系统会强制验证调用顺序，确保用户获取到有效的 API 列表后才能查询详细信息。

### 方式一：使用环境变量（推荐）
1. **配置环境变量** `APIFOX_API_KEY`
2. **第一步**：使用 `get_api_list` 工具获取完整 API 文档（无需参数）
3. **第二步**：从文档中找到感兴趣的 API，记录其接口标识符
4. **第三步**：使用 `get_api_detail` 工具，传入找到的 API ID 获取详细文档

### 方式二：提供参数
1. **第一步**：使用 `get_api_list` 工具，提供 Apifox 文档的 URL 或 Key
2. **第二步**：从返回的文档中找到感兴趣的 API，记录其接口标识符
3. **第三步**：使用 `get_api_detail` 工具，传入 Key 和找到的 API ID 获取详细文档

### 🛡️ 安全验证机制

- **调用顺序验证**：确保先调用 `get_api_list` 获取文档
- **灵活的 API ID 格式**：支持文档中的各种标识符格式
- **错误提示**：提供详细的错误信息和解决建议

### 📝 主要改进

**简化后的优势：**
- ✅ **更灵活**：支持不同格式的 Apifox 文档
- ✅ **更准确**：让 AI 直接分析原始文档内容
- ✅ **更可靠**：避免格式解析错误
- ✅ **更智能**：让 AI 自己识别正确的 API ID 格式
- ✅ **更清晰**：自动清理 HTML 标签，提取纯文本内容

## 安装和使用

### 1. 项目安装

```bash
cd /Users/arwen/Desktop/Arwen/Demo/cc-system/mcp/apifox-api-docs-mcp

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置你的 APIFOX_API_KEY

# 构建项目
npm run build
```

### 2. 在 Claude Code 中使用

**方式一：使用 .env 文件（推荐）**
```bash
# MCP 服务器会自动读取 .env 文件中的环境变量
claude mcp add apifox-api-docs node /Users/arwen/Desktop/Arwen/Demo/cc-system/mcp/apifox-api-docs-mcp/dist/index.js
```

**方式二：手动指定环境变量**
```bash
claude mcp add apifox-api-docs node /Users/arwen/Desktop/Arwen/Demo/cc-system/mcp/apifox-api-docs-mcp/dist/index.js --env APIFOX_API_KEY=your-key-here
```

### 3. 配置文件方式

在 `.claude/.mcp.json` 中添加：

```json
{
  "mcpServers": {
    "apifox-api-docs": {
      "command": "node",
      "args": ["/Users/arwen/Desktop/Arwen/Demo/cc-system/mcp/apifox-api-docs-mcp/dist/index.js"],
      "env": {
        "APIFOX_API_KEY": "your-api-key-here",
        "APIFOX_API_URL": "your-api-url"
      }
    }
  }
}
```

### 4. 环境变量优先级

1. **最高优先级**：手动提供的参数
2. **中等优先级**：MCP 配置中的 `env`
3. **最低优先级**：`.env` 文件

**推荐使用 .env 文件**，这样更安全且便于管理。

## 使用示例

### 方式一：使用环境变量（已配置 APIFOX_API_KEY）

#### 获取 API 列表
```
请使用 get_api_list 工具获取接口列表
```

#### 获取 API 详情
```
请使用 get_api_detail 工具获取这个 API 的详细信息：
apiId: get_user_list
```

### 方式二：提供参数（未配置环境变量）

#### 获取 API 列表
```
请使用 get_api_list 工具获取这个 Apifox 文档的接口列表：
99e805b6-d781-40bf-aad5-f8e1151ea228
```

或使用完整 URL：
```
请使用 get_api_list 工具获取这个 Apifox 文档的接口列表：
https://apifox.dragonpass.com.cn/apidoc/shared/99e805b6-d781-40bf-aad5-f8e1151ea228/api-3525338
```

#### 获取 API 详情
```
请使用 get_api_detail 工具获取这个 API 的详细信息：
key: 99e805b6-d781-40bf-aad5-f8e1151ea228
apiId: get_user_list
```

## 技术栈

- TypeScript
- Node.js
- MCP SDK
- Zod (数据验证)

## 开发

### 本地开发环境

项目已配置了本地化的 MCP Inspector 开发环境，提供更好的调试体验。

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发命令

```bash
# 开发模式（热重载）
pnpm dev

# 构建项目
pnpm build

# 启动服务
pnpm start

# 启动 MCP Inspector（通用）
pnpm inspector

# 调试 Apifox MCP 服务
pnpm debug:apifox
```

### 调试指南

1. **启动调试会话**：
   ```bash
   pnpm debug:apifox
   ```
   这会自动构建项目并启动 MCP Inspector

2. **在浏览器中访问**：
   Inspector 会启动在随机端口，按照控制台输出的链接访问

3. **测试 API 功能**：
   - 使用 Inspector 测试 Apifox API 调用
   - 查看请求/响应的详细信息
   - 调试数据解析问题

### 环境配置

确保 `.env` 文件配置正确：

```env
APIFOX_SPACE_ID=your_space_id
APIFOX_ACCESS_TOKEN=your_access_token
```

复制示例文件：
```bash
cp .env.example .env
# 然后编辑 .env 文件
```

### 项目结构

```
apifox-api-docs-mcp/
├── src/
│   ├── index.ts          # MCP 服务入口
│   ├── apifox-client.ts  # Apifox API 客户端
│   ├── html-cleaner.ts   # HTML 清理工具
│   └── types.ts          # 类型定义
├── dist/                 # 构建输出
├── package.json          # 项目配置
├── DEBUG.md              # 详细调试指南
├── example-usage.md      # 使用示例
└── README.md             # 项目说明
```

### 开发优势

✅ **环境隔离**：项目级别的开发环境，不依赖全局安装
✅ **版本锁定**：精确的 Inspector 版本控制
✅ **团队协作**：统一的调试体验
✅ **自动化**：一键构建并启动调试
✅ **CI/CD 友好**：可集成到自动化流程中