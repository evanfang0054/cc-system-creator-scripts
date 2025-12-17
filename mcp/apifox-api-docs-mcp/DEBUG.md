# MCP Inspector 调试指南

## 🚀 快速启动调试

### 启动调试会话

```bash
# 进入项目目录
cd /Users/arwen/Desktop/Arwen/Demo/cc-system/mcp/apifox-api-docs-mcp

# 一键启动调试（推荐）
pnpm debug:apifox

# 或分步执行
pnpm build
pnpm inspector
```

MCP Inspector 会自动启动并在控制台显示访问链接。

## 📱 访问 Inspector

启动后，控制台会显示类似以下的信息：

```bash
MCP Inspector running at: http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=xxxxxxxx
```

在浏览器中访问显示的链接即可打开 Inspector 界面。

## 🧪 调试步骤

### 第一步：验证工具列表

测试工具是否能正确列出：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

**预期结果：** 应该看到两个工具：
- `get_api_list`
- `get_api_detail`

### 第二步：测试 get_api_list

如果已配置环境变量，无需参数即可调用：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_api_list",
    "arguments": {}
  }
}
```

**预期结果：** 应该返回原始的 API 文档内容，包含完整的接口列表和说明。

### 第三步：测试调用顺序验证

尝试直接调用 `get_api_detail`（应该失败）：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_api_detail",
    "arguments": {
      "apiId": "test_id"
    }
  }
}
```

**预期结果：** 应该返回错误，提示必须先调用 `get_api_list`

### 第四步：测试完整工作流程

从 `get_api_list` 返回的文档中找到真实的 API ID，然后测试：

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_api_detail",
    "arguments": {
      "apiId": "[从文档中找到的API标识符]"
    }
  }
}
```

**注意：** API ID 的具体格式取决于 Apifox 文档的显示方式，可能是：
- `api-123456`
- `#123456`
- 数字编号
- 其他自定义格式

## 🔍 关键验证点

### 功能验证

- ✅ **工具列表正确显示**：能看到两个工具
- ✅ **get_api_list 无需参数即可调用**：环境变量配置正确
- ✅ **get_api_list 返回原始文档内容**：包含完整 API 信息
- ✅ **get_api_list 包含使用说明**：提供清晰的用户指导
- ✅ **get_api_detail 在未调用 get_api_list 时失败**：强制顺序验证
- ✅ **get_api_detail 接受各种格式的 API ID**：灵活的 ID 识别

### 错误处理验证

- ✅ **调用顺序验证**：get_api_detail 要求先调用 get_api_list
- ✅ **API ID 验证**：无效的 API ID 会被拒绝
- ✅ **错误提示**：提供清晰的错误信息和解决建议
- ✅ **网络错误处理**：妥善处理连接失败情况

## 🛠️ 故障排除

### 常见问题

1. **get_api_list 返回空内容**
   - 检查网络连接
   - 验证 APIFOX_API_KEY 是否正确
   - 确认 Apifox 服务器可访问性

2. **环境变量未生效**
   - 确认 `.env` 文件存在
   - 检查环境变量名称拼写
   - 重启调试会话

3. **get_api_detail 找不到接口**
   - 确认先调用了 get_api_list
   - 检查使用的 API ID 在文档中确实存在
   - 注意 API ID 的实际显示格式

4. **Inspector 无法启动**
   - 检查端口是否被占用
   - 确认项目已正确构建
   - 查看控制台错误信息

### 调试技巧

1. **观察原始文档内容**：注意 API ID 在文档中的实际格式
2. **使用控制台日志**：Inspector 会显示详细的请求/响应信息
3. **测试不同的 API ID 格式**：尝试文档中看到的各种标识符
4. **验证环境变量优先级**：手动参数会覆盖环境变量

## 📝 调试信息解读

### 响应格式分析

**get_api_list 成功响应：**
```json
{
  "content": [
    {
      "type": "text",
      "text": "找到 15 个 API 接口:\n\n1. **GET** /api/users\n   - 名称: 获取用户列表\n   - 描述: 获取所有用户的信息列表\n   - ID: get_api_users\n..."
    }
  ]
}
```

**get_api_detail 成功响应：**
```json
{
  "content": [
    {
      "type": "text",
      "text": "API 详细信息:\n\n**接口名称**: 获取用户列表\n**请求方法**: GET\n**请求路径**: /api/users\n..."
    }
  ]
}
```

**错误响应示例：**
```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ **必须先调用 get_api_list 工具**\n\n在使用 get_api_detail 之前，请先使用 get_api_list 工具获取 API 列表..."
    }
  ]
}
```

## 🎯 调试最佳实践

1. **先验证环境配置**：确保 `.env` 文件正确设置
2. **按顺序测试**：严格遵循 get_api_list → get_api_detail 的顺序
3. **观察文档结构**：仔细分析 get_api_list 返回的原始内容
4. **记录成功的模式**：注意能成功工作的 API ID 格式
5. **利用 Inspector 功能**：使用自动完成和历史记录功能
6. **保持耐心**：首次调试可能需要多次尝试

## 🔄 工作流程优化

### 自动化调试脚本

可以保存常用的 JSON 请求为 Inspector 书签，方便重复使用：

1. **工具列表检查**：`tools/list`
2. **API 列表获取**：`tools/call` + `get_api_list`
3. **API 详情获取**：`tools/call` + `get_api_detail`

### 批量测试

```json
// 批量获取多个 API 详情的模板
[
  {"method": "tools/call", "params": {"name": "get_api_detail", "arguments": {"apiId": "api-1"}}},
  {"method": "tools/call", "params": {"name": "get_api_detail", "arguments": {"apiId": "api-2"}}},
  {"method": "tools/call", "params": {"name": "get_api_detail", "arguments": {"apiId": "api-3"}}}
]
```

通过这个调试指南，你应该能够有效地测试和验证 Apifox API Docs MCP 服务器的所有功能。