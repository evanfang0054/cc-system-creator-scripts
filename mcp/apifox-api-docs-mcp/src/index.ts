#!/usr/bin/env node

import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ApifoxClient } from './apifox-client.js';

// 加载环境变量
config();

// 创建 Apifox 客户端实例
const apifoxClient = new ApifoxClient();


// 会话状态管理
interface SessionState {
  hasCalledGetApiList: boolean;
  lastUsedKey: string | null;
  documentContent: string | null;
}

const sessionStates = new Map<string, SessionState>();

// 获取或创建会话状态
const getSessionState = (key: string): SessionState => {
  if (!sessionStates.has(key)) {
    sessionStates.set(key, {
      hasCalledGetApiList: false,
      lastUsedKey: null,
      documentContent: null
    });
  }
  return sessionStates.get(key)!;
};

// 定义工具参数的 schema
const GetApiListSchema = z.object({
  input: z.string().optional().describe('Apifox API 文档的 URL 或 Key (可选，如果不提供则使用环境变量 APIFOX_API_KEY)')
});

const GetApiDetailSchema = z.object({
  key: z.string().optional().describe('Apifox API 文档的 Key (可选，如果不提供则使用环境变量 APIFOX_API_KEY)'),
  apiId: z.string().describe('API 接口的 ID 或标识符 (必须是 get_api_list 返回文档中存在的 API)')
});

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'apifox-api-docs-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const hasDefaultKey = !!process.env.APIFOX_API_KEY;

  return {
    tools: [
      {
        name: 'get_api_list',
        description: `获取 Apifox API 文档的接口列表${hasDefaultKey ? ' (已配置默认 Key)' : ''}`,
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: hasDefaultKey
                ? 'Apifox API 文档的 URL 或 Key (可选，如不提供则使用已配置的默认 Key)'
                : 'Apifox API 文档的 URL (如: https://apifox.evanfang.com.cn/apidoc/shared/99e805b6-d781-40bf-aad5-f8e1151ea228/api-3525338) 或直接的 Key (如: 99e805b6-d781-40bf-aad5-f8e1151ea228)'
            }
          },
          required: hasDefaultKey ? [] : ['input']
        }
      },
      {
        name: 'get_api_detail',
        description: `获取特定 API 接口的详细文档${hasDefaultKey ? ' (已配置默认 Key)' : ''} (必须先调用 get_api_list)`,
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: hasDefaultKey
                ? 'Apifox API 文档的 Key (可选，如不提供则使用已配置的默认 Key)'
                : 'Apifox API 文档的 Key (如: 99e805b6-d781-40bf-aad5-f8e1151ea228)'
            },
            apiId: {
              type: 'string',
              description: 'API 接口的 ID 或标识符 (必须是 get_api_list 返回文档中存在的具体 API，如 "api-123456" 或文档中显示的任何 API 标识)'
            }
          },
          required: hasDefaultKey ? ['apiId'] : ['key', 'apiId']
        }
      }
    ],
  };
});

// 注册工具调用处理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_api_list': {
        const validatedArgs = GetApiListSchema.parse(args);
        const { input } = validatedArgs;

        // 获取 key
        let key: string;
        if (input) {
          key = apifoxClient.extractKey(input);
        } else {
          if (!process.env.APIFOX_API_KEY) {
            throw new Error('未提供 input 参数，且未配置环境变量 APIFOX_API_KEY');
          }
          key = process.env.APIFOX_API_KEY;
        }

        // 获取 API 列表
        const result = await apifoxClient.getApiList(key);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `获取 API 列表失败: ${result.error}`
              }
            ]
          };
        }

        // 直接返回原始文档内容
        const documentContent = result.data || '';

        // 更新会话状态
        const sessionState = getSessionState(key);
        sessionState.hasCalledGetApiList = true;
        sessionState.lastUsedKey = key;
        sessionState.documentContent = documentContent;

        const responseText = `📋 **API 文档列表获取成功**

${documentContent}

💡 **使用 get_api_detail 的说明**：
- 请从上述文档中找到你感兴趣的 API
- 查找文档中的 API ID、接口标识符或接口编号（通常格式如：api-123456、#123456 等）
- 使用找到的 API ID 调用 get_api_detail 工具获取详细信息

📝 **示例格式**：
- 如果文档中显示 "接口ID: api-123456"，则使用 "api-123456"
- 如果文档中显示 "API #789"，则使用 "789" 或文档中显示的完整标识符`;

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };
      }

      case 'get_api_detail': {
        const validatedArgs = GetApiDetailSchema.parse(args);
        const { key: providedKey, apiId } = validatedArgs;

        // 获取 key
        let key: string;
        if (providedKey) {
          key = providedKey;
        } else {
          if (!process.env.APIFOX_API_KEY) {
            throw new Error('未提供 key 参数，且未配置环境变量 APIFOX_API_KEY');
          }
          key = process.env.APIFOX_API_KEY;
        }

        // 验证调用顺序
        const sessionState = getSessionState(key);

        if (!sessionState.hasCalledGetApiList) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ **必须先调用 get_api_list 工具**

在使用 get_api_detail 之前，请先使用 get_api_list 工具获取 API 文档列表。

**正确的工作流程：**
1. 首先调用：get_api_list - 获取完整的 API 文档内容
2. 查找文档中的 API ID 或接口标识符
3. 然后调用：get_api_detail - 使用找到的具体 API ID 获取详细信息

请先使用 get_api_list 工具获取 API 文档。`
              }
            ]
          };
        }

        // 获取 API 详细信息
        const result = await apifoxClient.getApiDetail(key, apiId);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `获取 API 详细信息失败: ${result.error}`
              }
            ]
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `API 详细文档:\n\n${result.data}`
            }
          ]
        };
      }

      default:
        throw new Error(`未知的工具: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    return {
      content: [
        {
          type: 'text',
          text: `工具执行出错: ${errorMessage}`
        }
      ]
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Apifox API Docs MCP Server running on stdio');
}

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});