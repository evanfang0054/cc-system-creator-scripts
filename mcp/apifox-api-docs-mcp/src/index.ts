#!/usr/bin/env node

/**
 * Apifox API 文档 MCP 服务器
 *
 * 此服务器提供与 Apifox API 文档交互的工具，支持获取 API 接口列表
 * 和详细信息，遵循 MCP SDK 最佳实践。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createRequire } from "module";
import { ApifoxClient } from "./apifox-client.js";
import {
  resolveApiKey,
  hasDefaultApiKey,
  formatSuccessResponse,
  formatErrorResponse,
  formatServerError,
  configManager
} from "./utils/index.js";
import { API_TIMEOUT, API_RETRIES, API_KEY_VALIDATION } from "./utils/constants.js";

const require = createRequire(import.meta.url);
const { version: SERVER_VERSION } = require("../package.json");

// 环境变量加载
if (!hasDefaultApiKey()) {
  try {
    (await import('dotenv')).config();
    if (process.env.NODE_ENV === 'development') {
      console.error('[Apifox MCP] 已从 .env 文件加载环境变量');
    }
  } catch {
    // dotenv 未安装，忽略
  }
}

// 服务器初始化
const apifoxClient = new ApifoxClient();
const hasApiKey = hasDefaultApiKey();
const baseUrl = configManager.getBaseUrl();

// 创建 MCP 服务器
const server = new McpServer(
  {
    name: 'apifox-api-docs-mcp',
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 获取 API 列表工具
server.registerTool(
  "apifox_get_api_list",
  {
    title: "获取 Apifox API 列表",
    description: `获取 Apifox API 文档的接口列表

## 使用场景
- 获取 API 文档的完整接口列表
- 获取 API ID 列表以调用 apifox_get_api_detail

## 参数说明
- \`timeout\` (number): 请求超时时间（毫秒，${API_TIMEOUT.MIN}-${API_TIMEOUT.MAX}，默认 ${API_TIMEOUT.DEFAULT}）
- \`retries\` (number): 重试次数（${API_RETRIES.MIN}-${API_RETRIES.MAX}，默认 ${API_RETRIES.DEFAULT}）

## 返回值
完整的 API 文档列表，包含所有可用的 API 接口信息、文档来源和大小信息。

## 错误处理
- API Key 无效：返回 "错误：无效的 API Key 或 URL 格式"
- 网络失败：返回 "错误：网络连接失败，请检查网络设置"`,
    inputSchema: z.object({
      // input: z.string()
      //   .min(API_KEY_VALIDATION.MIN_LENGTH, `API Key 长度不能少于 ${API_KEY_VALIDATION.MIN_LENGTH} 个字符`)
      //   .max(API_KEY_VALIDATION.MAX_LENGTH, `API Key 长度不能超过 ${API_KEY_VALIDATION.MAX_LENGTH} 个字符`)
      //   .describe(`Apifox API 文档的 URL 或 UUID ${hasApiKey ? '(可选，默认使用已配置 Key)' : '(必需)'}`)
      //   .optional(),
      timeout: z.number()
        .int()
        .min(API_TIMEOUT.MIN, `超时时间不能少于 ${API_TIMEOUT.MIN} 毫秒`)
        .max(API_TIMEOUT.MAX, `超时时间不能超过 ${API_TIMEOUT.MAX} 毫秒`)
        .describe(`请求超时时间（毫秒，${API_TIMEOUT.MIN}-${API_TIMEOUT.MAX}，默认 ${API_TIMEOUT.DEFAULT}）`)
        .optional(),
      retries: z.number()
        .int()
        .min(API_RETRIES.MIN, `重试次数不能少于 ${API_RETRIES.MIN}`)
        .max(API_RETRIES.MAX, `重试次数不能超过 ${API_RETRIES.MAX}`)
        .describe(`重试次数（${API_RETRIES.MIN}-${API_RETRIES.MAX}，默认 ${API_RETRIES.DEFAULT}）`)
        .optional(),
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ timeout, retries }) => {
    try {
      const apiKey = resolveApiKey(); // 使用环境变量中的 API Key
      const result = await apifoxClient.getApiList(apiKey, { timeout, retries });

      if (!result.success) {
        return formatErrorResponse(
          '获取 API 列表失败',
          result.error || '未知错误',
          ['检查 API Key 或 URL 格式是否正确', '确认网络连接正常']
        );
      }

      const data = result.data ?? '';
      return formatSuccessResponse(
        '成功获取 API 文档列表',
        data,
        {
          来源: apiKey,
          长度: `${data.length} 字符`
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return formatServerError('apifox_get_api_list', message);
    }
  }
);

// 获取 API 详情工具
server.registerTool(
  "apifox_get_api_detail",
  {
    title: "获取 Apifox API 详情",
    description: `获取指定 API 的详细文档信息

## 使用场景
- 已通过 apifox_get_api_list 获取到 apiId 后
- 需要查看特定 API 的详细文档时

## 参数说明
- \`key\` (string): Apifox API 文档的 Key ${hasApiKey ? '(可选)' : '(必需)'}
- \`apiId\` (string): API 接口的 ID 或标识符（必需，必须是 apifox_get_api_list 返回文档中存在的 API）
- \`timeout\` (number): 请求超时时间（毫秒，${API_TIMEOUT.MIN}-${API_TIMEOUT.MAX}，默认 ${API_TIMEOUT.DEFAULT}）
- \`retries\` (number): 重试次数（${API_RETRIES.MIN}-${API_RETRIES.MAX}，默认 ${API_RETRIES.DEFAULT}）

## 返回值
指定 API 的详细文档信息，包含请求参数、响应格式等完整信息和文档大小信息。

## 使用流程
1. 先调用 apifox_get_api_list 获取 API 列表
2. 从返回的文档中找到需要的 apiId
3. 使用有效的 apiId 调用此工具获取详情

## 错误处理
- API ID 不存在：返回 "错误：API ID 不存在于文档中"
- Key 无效：返回 "错误：无效的 API Key"`,
    inputSchema: z.object({
      key: z.string()
        .describe(`Apifox API 文档的 Key ${hasApiKey ? '(可选)' : '(必需)'}`)
        .optional(),
      apiId: z.string()
        .min(API_KEY_VALIDATION.API_ID_MIN_LENGTH, `API ID 长度不能少于 ${API_KEY_VALIDATION.API_ID_MIN_LENGTH} 个字符`)
        .max(API_KEY_VALIDATION.API_ID_MAX_LENGTH, `API ID 长度不能超过 ${API_KEY_VALIDATION.API_ID_MAX_LENGTH} 个字符`)
        .describe('API 接口的 ID 或标识符（必须是 apifox_get_api_list 返回文档中存在的 API）'),
      timeout: z.number()
        .int()
        .min(API_TIMEOUT.MIN, `超时时间不能少于 ${API_TIMEOUT.MIN} 毫秒`)
        .max(API_TIMEOUT.MAX, `超时时间不能超过 ${API_TIMEOUT.MAX} 毫秒`)
        .describe(`请求超时时间（毫秒，${API_TIMEOUT.MIN}-${API_TIMEOUT.MAX}，默认 ${API_TIMEOUT.DEFAULT}）`)
        .optional(),
      retries: z.number()
        .int()
        .min(API_RETRIES.MIN, `重试次数不能少于 ${API_RETRIES.MIN}`)
        .max(API_RETRIES.MAX, `重试次数不能超过 ${API_RETRIES.MAX}`)
        .describe(`重试次数（${API_RETRIES.MIN}-${API_RETRIES.MAX}，默认 ${API_RETRIES.DEFAULT}）`)
        .optional(),
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ key, apiId, timeout, retries }) => {
    try {
      const apiKey = resolveApiKey(key);
      const result = await apifoxClient.getApiDetail(apiKey, apiId, { timeout, retries });

      if (!result.success) {
        return formatErrorResponse(
          '获取 API 详情失败',
          result.error || '未知错误',
          [
            `确认 API ID \`${apiId}\` 存在于文档中`,
            '检查 API ID 拼写是否正确',
            '确保已调用 apifox_get_api_list 获取有效列表'
          ]
        );
      }

      const data = result.data ?? '';
      return formatSuccessResponse(
        '成功获取 API 详情',
        data,
        {
          'API ID': `\`${apiId}\``,
          长度: `${data.length} 字符`
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return formatServerError('apifox_get_api_detail', message);
    }
  }
);

// 健康检查工具
server.registerTool(
  "apifox_health_check",
  {
    title: "Apifox 服务器健康检查",
    description: `检查 MCP 服务器和配置状态

## 使用场景
- 验证服务器是否正常运行
- 检查配置状态（API Key、版本号等）
- 排查环境配置问题

## 返回值
服务器状态信息，包括版本、基础 URL、API Key 配置状态、Node 环境和可用工具数量。`,
    inputSchema: z.object({}).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async () => {
    return formatSuccessResponse(
      '**Apifox MCP 服务器状态**',
      '',
      {
        '服务器版本': SERVER_VERSION,
        '基础 URL': baseUrl,
        '已配置 API Key': hasApiKey ? '是' : '否',
        'Node 环境': process.env.NODE_ENV || 'production',
        '可用工具': '3 个',
        'API 超时范围': `${API_TIMEOUT.MIN}-${API_TIMEOUT.MAX} 毫秒`,
        '重试范围': `${API_RETRIES.MIN}-${API_RETRIES.MAX} 次`
      }
    );
  }
);

// 服务器启动
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  if (process.env.NODE_ENV === 'development') {
    console.error('[Apifox MCP] 服务器已启动');
    console.error('[Apifox MCP] 基础 URL:', baseUrl);
    console.error('[Apifox MCP] 已配置 API Key:', hasApiKey);
  }
}

// 优雅关闭处理
const shutdown = () => {
  console.error('[Apifox MCP] 正在关闭...');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 启动服务器
main().catch((error) => {
  console.error('[Apifox MCP] 启动失败:', error);
  process.exit(1);
});
