#!/usr/bin/env node

/**
 * Apifox API 文档 MCP 服务器
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ApifoxClient } from './apifox-client.js';
import { ValidationError } from './errors.js';
import { createRequire } from 'module';

// 读取 package.json 获取版本号
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const SERVER_VERSION = packageJson.version;

// ============================================================================
// 环境变量加载（条件性支持 .env）
// ============================================================================

const hasEnvFromClient = !!process.env.APIFOX_API_KEY;

// 本地开发模式下加载 .env
if (!hasEnvFromClient) {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
    if (process.env.NODE_ENV === 'development') {
      console.error('[Apifox MCP] 已从 .env 文件加载环境变量');
    }
  } catch {
    // dotenv 未安装，忽略
  }
}

// ============================================================================
// MCP 服务器初始化
// ============================================================================

const apifoxClient = new ApifoxClient();
const hasApiKey = !!process.env.APIFOX_API_KEY;
const baseUrl = process.env.APIFOX_BASE_URL || 'https://apifox.evanfang.com.cn';

const server = new Server(
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

// ============================================================================
// 工具定义和 Zod Schema
// ============================================================================

// 工具描述常量
const TOOLS = {
  getApiList: {
    name: 'get_api_list',
    description: `获取 Apifox API 文档的接口列表

功能特性：
- 支持完整 URL 和 UUID Key 格式
- 自动错误重试和超时控制
- 获取完整的 API 接口列表

${hasApiKey ? '✅ 已配置默认 API Key' : '⚠️ 需要提供 API Key 或 URL'}

支持格式：
- UUID: 00000000-0000-0000-0000-000000000000
- 完整 URL: ${baseUrl}/apidoc/shared/{UUID}`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string' as const,
          description: hasApiKey
            ? 'Apifox API 文档的 URL 或 UUID Key (可选，如不提供则使用已配置的默认 Key)'
            : 'Apifox API 文档的 URL 或 UUID Key (必需)',
        },
        timeout: {
          type: 'number' as const,
          description: '请求超时时间（毫秒，1000-60000，默认 10000）',
          default: 10000,
        },
        retries: {
          type: 'number' as const,
          description: '重试次数（0-5，默认 2）',
          default: 2,
        },
      },
    },
  },
  getApiDetail: {
    name: 'get_api_detail',
    description: `获取指定 API 的详细文档信息

功能特性：
- 自动错误重试和恢复
- 详细的参数验证

使用建议：
建议先调用 \`get_api_list\` 获取可用的 apiId 列表，然后使用有效的 apiId 调用此工具。`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        key: {
          type: 'string' as const,
          description: hasApiKey
            ? 'Apifox API 文档的 Key (可选，如不提供则使用已配置的默认 Key)'
            : 'Apifox API 文档的 Key (必需)',
        },
        apiId: {
          type: 'string' as const,
          description: 'API 接口的 ID 或标识符 (必须是 get_api_list 返回文档中存在的 API)',
        },
        timeout: {
          type: 'number' as const,
          description: '请求超时时间（毫秒，1000-60000，默认 10000）',
          default: 10000,
        },
        retries: {
          type: 'number' as const,
          description: '重试次数（0-5，默认 2）',
          default: 2,
        },
      },
      required: ['apiId'] as const,
    },
  },
  healthCheck: {
    name: 'health_check',
    description: `检查 MCP 服务器和配置状态,当前版本${SERVER_VERSION}`,
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
} as const satisfies Record<string, Tool>;

// Zod Schema 用于运行时验证
const GetApiListSchema = z.object({
  input: z.string().min(1).max(1000).optional(),
  timeout: z.number().int().min(1000).max(60000).optional(),
  retries: z.number().int().min(0).max(5).optional(),
});

const GetApiDetailSchema = z.object({
  key: z.string().optional(),
  apiId: z.string().min(1).max(100),
  timeout: z.number().int().min(1000).max(60000).optional(),
  retries: z.number().int().min(0).max(5).optional(),
});

// ============================================================================
// MCP 处理器
// ============================================================================

// 列出可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(TOOLS),
}));

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // 参数验证
    switch (name) {
      case TOOLS.getApiList.name: {
        const params = GetApiListSchema.parse(args);

        // 确定 API Key
        const apiKey = params.input || process.env.APIFOX_API_KEY || '';
        if (!apiKey) {
          throw new ValidationError('未提供 API Key，且环境变量 APIFOX_API_KEY 未设置');
        }

        // 调用客户端
        const result = await apifoxClient.getApiList(apiKey, {
          timeout: params.timeout,
          retries: params.retries,
        });

        if (!result.success) {
          return {
            content: [{
              type: 'text' as const,
              text: `❌ 获取 API 列表失败\n\n**错误**: ${result.error}\n\n**建议**:\n- 检查 API Key 或 URL 格式是否正确\n- 确认网络连接正常`,
            }],
          };
        }

        return {
          content: [{
            type: 'text' as const,
            text: `✅ 成功获取 API 文档列表\n\n**来源**: ${apiKey}\n**长度**: ${result.data?.length || 0} 字符\n\n---\n\n${result.data}`,
          }],
        };
      }

      case TOOLS.getApiDetail.name: {
        const params = GetApiDetailSchema.parse(args);

        // 确定 API Key（优先级：参数 > 环境变量）
        const apiKey = params.key || process.env.APIFOX_API_KEY || '';
        if (!apiKey) {
          throw new ValidationError('未提供 API Key，且环境变量 APIFOX_API_KEY 未设置');
        }

        // 调用客户端
        const result = await apifoxClient.getApiDetail(apiKey, params.apiId, {
          timeout: params.timeout,
          retries: params.retries,
        });

        if (!result.success) {
          return {
            content: [{
              type: 'text' as const,
              text: `❌ 获取 API 详情失败\n\n**API ID**: \`${params.apiId}\`\n**错误**: ${result.error}\n\n**建议**:\n- 确认 API ID 存在于文档中\n- 检查 API ID 拼写是否正确`,
            }],
          };
        }

        return {
          content: [{
            type: 'text' as const,
            text: `✅ 成功获取 API 详情\n\n**API ID**: \`${params.apiId}\`\n**长度**: ${result.data?.length || 0} 字符\n\n---\n\n${result.data}`,
          }],
        };
      }

      case TOOLS.healthCheck.name: {
        return {
          content: [{
            type: 'text' as const,
            text: `✅ **Apifox MCP 服务器状态**

**服务器版本**: ${SERVER_VERSION}
**基础 URL**: ${baseUrl}
**已配置 API Key**: ${hasApiKey ? '是' : '否'}
**Node 环境**: ${process.env.NODE_ENV || 'production'}
**可用工具**: ${Object.keys(TOOLS).length} 个`,
          }],
        };
      }

      default:
        throw new ValidationError(`未知工具: ${name}`, {
          available: Object.keys(TOOLS).join(', '),
        });
    }
  } catch (error) {
    // 处理 Zod 验证错误
    if (error instanceof z.ZodError) {
      return {
        content: [{
          type: 'text' as const,
          text: `❌ 参数验证失败\n\n${error.errors.map(e => `- ${e.path.join('.')}: ${e.message}`).join('\n')}`,
        }],
      };
    }

    // 处理其他错误
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text' as const,
        text: `❌ 服务器错误\n\n**工具**: ${name}\n**错误**: ${message}\n\n请检查输入参数或稍后重试。`,
      }],
    };
  }
});

// ============================================================================
// 服务器启动
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  if (process.env.NODE_ENV === 'development') {
    console.error('[Apifox MCP] 服务器已启动');
    console.error('[Apifox MCP] 基础 URL:', baseUrl);
    console.error('[Apifox MCP] 已配置 API Key:', hasApiKey);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.error('[Apifox MCP] 正在关闭...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[Apifox MCP] 正在关闭...');
  process.exit(0);
});

// 启动
main().catch((error) => {
  console.error('[Apifox MCP] 启动失败:', error);
  process.exit(1);
});
