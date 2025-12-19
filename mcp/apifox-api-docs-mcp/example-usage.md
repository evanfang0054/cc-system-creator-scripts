# Apifox API Docs MCP 服务器使用示例

## 环境变量配置的优势

通过配置 `APIFOX_API_KEY` 环境变量，你可以获得更便捷的使用体验：

### 配置前（每次都需要提供参数）
```bash
# 获取 API 列表
请使用 get_api_list 工具获取这个 Apifox 文档的接口列表：
99e805b6-d781-40bf-aad5-f8e1151ea228

# 获取 API 详情
请使用 get_api_detail 工具获取这个 API 的详细信息：
key: 99e805b6-d781-40bf-aad5-f8e1151ea228
apiId: get_user_list
```

### 配置后（环境变量已设置）
```bash
# 获取 API 列表（无需参数）
请使用 get_api_list 工具获取接口列表

# 获取 API 详情（只需提供 API ID）
请使用 get_api_detail 工具获取这个 API 的详细信息：
apiId: get_user_list
```

## 典型工作流程

### 🔑 强制步骤 1: 获取 API 列表（必须首先执行）
```bash
请使用 get_api_list 工具获取所有可用的 API 接口
```

**返回示例：**
```
找到 15 个 API 接口:

1. **GET** /api/users
   - 名称: 获取用户列表
   - 描述: 获取所有用户的信息列表
   - ID: get_api_users

2. **POST** /api/users
   - 名称: 创建新用户
   - 描述: 创建一个新的用户账户
   - ID: post_api_users

3. **GET** /api/users/{id}
   - 名称: 获取单个用户信息
   - 描述: 根据用户ID获取特定用户信息
   - ID: get_api_users_id

💡 **提示**: 现在可以使用 get_api_detail 工具获取任意 API 的详细信息。请从上述列表中选择需要的 API ID。
```

### 🔑 强制步骤 2: 获取特定 API 详情（必须先完成步骤1）
从上面的列表中选择一个感兴趣的 API，例如 `get_api_users`：

```bash
请使用 get_api_detail 工具获取 ID 为 "get_api_users" 的 API 详细信息
apiId: get_api_users
```

### 🔑 步骤 3: 分析 API 文档
根据返回的详细文档，你可以了解：
- API 的完整路径
- 请求参数
- 响应格式
- 错误处理
- 使用示例

## ⚠️ 错误处理示例

### 场景 1: 未先调用 get_api_list
```bash
请使用 get_api_detail 工具获取 API 详情
apiId: some_api_id
```

**错误响应：**
```
❌ **必须先调用 get_api_list 工具**

在使用 get_api_detail 之前，请先使用 get_api_list 工具获取 API 列表。

**正确的工作流程：**
1. 首先调用：get_api_list - 获取所有可用的 API 接口列表
2. 然后调用：get_api_detail - 使用从列表中选择的具体 API ID 获取详细信息

请先使用 get_api_list 工具获取接口列表。
```

### 场景 2: 使用无效的 API ID
```bash
请使用 get_api_detail 工具获取 ID 为 "invalid_id" 的 API 详情
apiId: invalid_id
```

**错误响应：**
```
❌ **无效的 API ID**

提供的 API ID "invalid_id" 不在有效的 API 列表中。

**可用的 API ID：**
- get_api_users
- post_api_users
- get_api_users_id
- ... 以及其他 12 个 API

请从上述列表中选择一个有效的 API ID，或重新调用 get_api_list 获取最新的 API 列表。
```

## 高级用法

### 动态切换 Key
即使配置了环境变量，你仍然可以在工具调用时提供不同的 Key：

```bash
# 使用临时的不同 Key
请使用 get_api_list 工具获取这个项目的 API 列表：
https://apifox.evanfang.com.cn/apidoc/shared/another-key-123/api-456
```

### 批量分析
```bash
请先获取所有 API 列表，然后选择前 5 个接口，分别获取它们的详细信息
```

## 注意事项

1. **安全性**：不要在公共环境中暴露你的 Apifox Key
2. **优先级**：工具调用时提供的参数会优先于环境变量
3. **灵活性**：可以随时切换不同的项目，无需重新配置 MCP 服务器