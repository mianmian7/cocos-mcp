---
inclusion: fileMatch
fileMatchPattern: ['source/mcp/tools/*.ts', 'source/mcp/services/*.ts']
---

# MCP工具和服务开发指南

## 🛠️ MCP工具开发规范

### 工具文件结构
每个工具文件应该遵循以下结构：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerToolNameTool(server: McpServer): void {
  server.registerTool(
    "tool_name", // 工具标识符
    {
      title: "工具标题",
      description: "工具详细描述",
      inputSchema: {
        // Zod schema 定义输入参数
        parameter: z.string().describe("参数描述")
      }
    },
    async (args) => {
      // 工具实现逻辑
      try {
        // 业务逻辑
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result)
          }]
        };
      } catch (error) {
        // 错误处理
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error)
            })
          }]
        };
      }
    }
  );
}
```

### 命名规范
- 文件名: 使用kebab-case，如 `create-nodes.ts`
- 函数名: 使用camelCase，如 `registerCreateNodesTool`
- 工具名: 使用snake_case，如 `"create_nodes"`

### 工具分类和职责
- **查询工具**: 以`query_`开头，只读取数据，不修改状态
- **操作工具**: 以`operate_`开头，执行具体的修改操作
- **创建工具**: 以`create_`开头，创建新的资源或实体
- **修改工具**: 以`modify_`开头，更新现有资源属性

### 输入验证
```typescript
// 使用Zod进行严格的输入验证
inputSchema: {
  nodeUuid: z.string().describe("节点UUID"),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional().describe("节点位置"),
  components: z.array(z.string()).default([]).describe("要添加的组件类型")
}
```

## 🔧 Cocos Creator API集成

### 消息系统调用
```typescript
// 异步API调用
const result = await Editor.Message.request('scene', 'query-node', {
  uuid: nodeUuid
});

// 同步API调用
Editor.Message.send('scene', 'create-node', {
  parent: parentUuid
}, (err, result) => {
  if (err) {
    // 错误处理
  } else {
    // 成功处理
  }
});
```

### 常用API方法
- `scene:create-node` - 创建节点
- `scene:query-node` - 查询节点信息
- `scene:set-property` - 设置节点属性
- `scene:query-node-tree` - 查询场景树结构
- `asset-db:query-asset-info` - 查询资源信息

### UUID处理
```typescript
import { McpServerManager } from "../server-manager";

// 编码UUID (用于输出)
const encodedUuid = McpServerManager.encodeUuid(rawUuid);

// 解码UUID (用于API调用)
const rawUuid = McpServerManager.decodeUuid(encodedUuid);
```

## 📊 错误处理和日志

### 统一的错误响应格式
```typescript
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: additionalInfo // 可选的详细信息
    })
  }]
};
```

### 日志记录
```typescript
console.log('工具执行开始:', { toolName, args });
console.error('工具执行错误:', error);
console.log('工具执行完成:', result);
```

## 🔒 安全考虑

### 输入验证
- 所有输入必须通过Zod schema验证
- UUID参数需要验证格式
- 路径参数需要防止路径遍历攻击

### 权限控制
- 文件系统操作需要特别谨慎
- 敏感操作应该记录日志
- 考虑添加操作确认机制

### 资源管理
- 正确处理异步操作的清理
- 避免内存泄漏
- 实现适当的超时机制

## 🎯 最佳实践

### 1. 原子性操作
```typescript
// 使用事务确保操作的原子性
try {
  await Editor.Message.request('scene', 'snapshot'); // 创建快照
  // 执行操作
  await Editor.Message.request('scene', 'snapshot'); // 保存更改
} catch (error) {
  // 回滚操作
}
```

### 2. 批量操作优化
```typescript
// 对于批量操作，使用Promise.all并行处理
const results = await Promise.all(
  nodes.map(node => processNode(node))
);
```

### 3. 异步操作处理
```typescript
// 正确处理异步操作和错误
const promises = operations.map(async (op) => {
  try {
    return await executeOperation(op);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

const results = await Promise.allSettled(promises);
```

### 4. 工具注册
```typescript
// 在server-manager.ts中正确注册工具
import { registerCreateNodesTool } from "./tools/create-nodes.js";

// 在createMcpServer方法中注册
if (tools.createNodes) {
  registerCreateNodesTool(server);
}
```

## 📈 性能优化

### 1. 缓存机制
```typescript
// 使用缓存避免重复查询
const cache = new Map();

async function getComponentInfo(componentUuid: string) {
  if (cache.has(componentUuid)) {
    return cache.get(componentUuid);
  }

  const info = await Editor.Message.request('scene', 'query-component', {
    uuid: componentUuid
  });

  cache.set(componentUuid, info);
  return info;
}
```

### 2. 增量更新
```typescript
// 只更新变化的部分
const changes = calculateChanges(currentState, newState);
if (changes.length > 0) {
  await applyChanges(changes);
}
```

### 3. 延迟加载
```typescript
// 懒加载不常用的功能
let heavyModule = null;

async function getHeavyModule() {
  if (!heavyModule) {
    heavyModule = await import('./heavy-module.js');
  }
  return heavyModule;
}
```