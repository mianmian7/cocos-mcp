---
inclusion: fileMatch
fileMatchPattern: ['*.ts', '*.json', 'tsconfig*.json', 'package.json']
---

# TypeScript项目配置和构建规范

## 📋 项目配置概览

### package.json配置
```json
{
  "$schema": "./@types/schema/package/index.json",
  "package_version": 2,
  "name": "cocos-mcp",
  "version": "1.0.2",
  "author": "Roma Rogov, mianmian7",
  "editor": ">=3.8.6",
  "scripts": {
    "preinstall": "node ./scripts/preinstall.js",
    "build": "npx tsc"
  },
  "description": "i18n:cocos-mcp.description",
  "main": "./dist/main.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "express": "^4.18.2",
    "vue": "^3.1.4",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@cocos/creator-types": "^3.8.6",
    "@types/express": "^4.17.17",
    "@types/node": "^18.17.1",
    "typescript": "^5.8.2"
  }
}
```

### TypeScript配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./source",
    "resolveJsonModule": true,
    "baseUrl": "./source",
    "paths": {
      "@/*": ["*"]
    },
    "typeRoots": ["./@types", "node_modules/@types"]
  },
  "include": [
    "source/**/*",
    "@types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 基础tsconfig配置 (base.tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "resolveJsonModule": true,
    "typeRoots": ["../@types", "../../node_modules/@types"]
  }
}
```

## 🔧 TypeScript开发规范

### 1. 类型定义
```typescript
// source/types/common.ts
export interface ServerConfig {
  port: number;
  name?: string;
  version?: string;
}

export interface ToolConfig {
  createNodes?: boolean;
  modifyNodes?: boolean;
  queryNodes?: boolean;
  // ... 其他工具配置
}

export interface McpServerConfig extends ServerConfig {
  tools: ToolConfig;
  imageGeneration?: ImageGenerationConfig;
}

// 避免使用any类型
// ❌ 不要这样写
const config: any = {};

// ✅ 应该这样写
const config: Partial<McpServerConfig> = {};
```

### 2. 接口和类型别名
```typescript
// 使用接口定义对象结构
export interface NodeInfo {
  uuid: string;
  name: string;
  position: Vec3;
  components: ComponentInfo[];
}

// 使用类型别名定义联合类型
export type NodeType = 'Empty' | 'Sprite' | 'Label' | 'Button' | 'Prefab';

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'error';
```

### 3. 泛型使用
```typescript
// 泛型函数
export async function createResource<T extends BaseResource>(
  type: ResourceType,
  data: Partial<T>
): Promise<T> {
  const result = await Editor.Message.request('scene', 'create-node', data);
  return result as T;
}

// 泛型接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 4. 枚举替代
```typescript
// 使用联合类型替代枚举
export const NodeTypes = {
  EMPTY: 'Empty',
  SPRITE: 'Sprite',
  LABEL: 'Label',
  BUTTON: 'Button'
} as const;

export type NodeType = typeof NodeTypes[keyof typeof NodeTypes];

// 使用对象映射替代枚举
export const ComponentCategories = {
  RENDER: 'Render',
  PHYSICS: 'Physics',
  UI: 'UI',
  AUDIO: 'Audio'
} as const;

export type ComponentCategory = typeof ComponentCategories[keyof typeof ComponentCategories];
```

## 🏗️ 构建和编译

### 构建命令
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 清理构建产物
rm -rf dist

# 重新构建
npm run build
```

### 构建产物结构
```
dist/
├── main.js                    # 扩展主入口文件
├── panels/
│   ├── default/
│   │   ├── index.js          # 默认面板入口
│   │   └── panel.vue         # Vue组件 (会被编译)
│   ├── ai-config/
│   │   ├── index.js
│   │   └── panel.vue
│   └── image-generator/
│       ├── index.js
│       └── panel.vue
├── mcp/
│   ├── server-manager.js     # 服务器管理器
│   ├── tools/
│   │   ├── create-nodes.js   # 所有工具文件
│   │   ├── modify-nodes.js
│   │   └── ...
│   ├── services/
│   │   └── image-generation-service.js
│   └── config.js
├── scene/
│   └── index.js              # 场景脚本
└── types/                    # 类型定义
    └── ...
```

## 📦 模块导入规范

### 1. 相对路径导入
```typescript
// 同一目录下的文件
import { McpServerManager } from './server-manager';

// 父目录的文件
import { ConfigStorage } from '../config-storage';

// 子目录的文件
import { registerCreateNodesTool } from './tools/create-nodes';
```

### 2. 绝对路径导入 (推荐)
```typescript
// 使用@别名导入
import { McpServerManager } from '@/mcp/server-manager';
import { ConfigStorage } from '@/mcp/config-storage';
import { registerCreateNodesTool } from '@/mcp/tools/create-nodes';
```

### 3. 第三方库导入
```typescript
// 第三方库
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import express from 'express';

// 类型导入
import type { Request, Response } from 'express';
import type { z } from 'zod';
```

### 4. Cocos Creator API导入
```typescript
// Cocos Creator类型
import { ExecuteSceneScriptMethodOptions } from '@cocos/creator-types/editor/packages/scene/@types/public';

// 扩展API
import packageJSON from '../package.json';

// Vue组件
import { createApp } from 'vue';
import App from './App.vue';
```

## 🔍 类型检查和错误处理

### 1. 严格的类型检查
```typescript
// 启用严格模式下的所有检查选项
// tsconfig.json 中设置 "strict": true

// 使用类型断言时要谨慎
const nodeInfo = result as NodeInfo; // 只在确定类型时使用

// 使用类型守护
function isNodeInfo(obj: any): obj is NodeInfo {
  return obj && typeof obj.uuid === 'string' && typeof obj.name === 'string';
}

// 使用非空断言
const nodeName = nodeInfo!.name; // 只在确定不为null时使用
```

### 2. 错误处理
```typescript
// 异步函数错误处理
async function riskyOperation(): Promise<NodeInfo> {
  try {
    const result = await Editor.Message.request('scene', 'query-node', {
      uuid: nodeUuid
    });
    return result as NodeInfo;
  } catch (error) {
    console.error('查询节点失败:', error);
    throw new Error(`Failed to query node: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Promise错误处理
riskyOperation()
  .then(result => {
    console.log('操作成功:', result);
  })
  .catch(error => {
    console.error('操作失败:', error);
  });
```

### 3. 可选链和空值检查
```typescript
// 使用可选链
const componentName = nodeInfo?.components?.[0]?.name;

// 空值合并
const port = config.port ?? 3000;

// 条件访问
if (nodeInfo && nodeInfo.components) {
  // 安全的访问
}
```

## 📝 代码注释规范

### 1. 文件头部注释
```typescript
/**
 * @fileoverview MCP服务器管理器
 * @description 负责MCP服务器的生命周期管理、工具注册和HTTP传输
 * @author cocos-mcp
 * @version 1.0.0
 */

/**
 * @description 创建MCP服务器实例并注册所有工具
 * @returns {McpServer} 配置好的MCP服务器实例
 */
```

### 2. 函数注释
```typescript
/**
 * 启动MCP服务器
 * @param config 服务器配置选项
 * @returns 启动结果
 * @throws {Error} 当服务器已在运行时抛出错误
 */
public async startServer(config?: Partial<McpServerConfig>): Promise<void> {
  if (this.isRunning) {
    throw new Error("Server is already running");
  }

  // 实现逻辑...
}
```

### 3. 复杂逻辑注释
```typescript
// 创建节点映射，用于快速查找和更新
const nodeMap = new Map<string, NodeInfo>();

// 验证配置完整性
// 检查所有必需的工具配置项是否都已启用
const requiredTools = ['createNodes', 'queryNodes', 'modifyNodes'];
const missingTools = requiredTools.filter(tool => !config.tools[tool]);

if (missingTools.length > 0) {
  throw new Error(`Missing required tools: ${missingTools.join(', ')}`);
}
```

## 🧪 调试和开发工具

### 1. 调试配置
```typescript
// 在tsconfig.json中启用sourceMap
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": false
  }
}
```

### 2. 开发时日志
```typescript
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('详细调试信息:', { config, status, result });
}

// 生产环境日志
console.log('MCP server started on port', this.config.port);
```

### 3. 性能监控
```typescript
// 操作计时
console.time('node-creation');
const result = await createNode(nodeSpec);
console.timeEnd('node-creation');

// 内存使用情况
const memUsage = process.memoryUsage();
console.log('Memory usage:', {
  rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
  heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
});
```