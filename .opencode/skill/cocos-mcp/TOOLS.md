# Cocos MCP 工具详细参考

本文档提供所有 16 个 MCP 工具的详细用法说明。

---

## 目录

1. [查询工具](#查询工具)
   - [query_nodes](#query_nodes)
   - [query_components](#query_components)
   - [get_available_component_types](#get_available_component_types)
   - [get_available_asset_types](#get_available_asset_types)
   - [get_assets_by_type](#get_assets_by_type)
2. [创建和修改工具](#创建和修改工具)
   - [create_nodes](#create_nodes)
   - [modify_nodes](#modify_nodes)
   - [modify_components](#modify_components)
3. [资源管理工具](#资源管理工具)
   - [operate_assets](#operate_assets)
   - [operate_current_scene](#operate_current_scene)
   - [operate_prefab_assets](#operate_prefab_assets)
   - [node_linked_prefabs_operations](#node_linked_prefabs_operations)
4. [高级工具](#高级工具)
   - [generate_image_asset](#generate_image_asset)
   - [operate_project_settings](#operate_project_settings)
   - [operate_scripts_and_text](#operate_scripts_and_text)
   - [execute_scene_code](#execute_scene_code)

---

## 查询工具

### query_nodes

**用途**：查询场景节点层次结构

**参数**：
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `nodeUuid` | string | 场景根 | 起始节点 UUID |
| `includeProperties` | boolean | false | 包含位置/旋转/缩放属性 |
| `includeComponents` | boolean | false | 包含组件列表 |
| `includeComponentProperties` | boolean | false | 包含组件详细属性 |
| `maxDepth` | number | 2 | 层次深度限制 |

**最佳实践**：
- 先用 `maxDepth=1` 了解顶层结构
- 需要详细信息时再增加深度或指定 `nodeUuid`
- 避免一次性查询整个大场景

**示例**：
```json
{
  "maxDepth": 1,
  "includeProperties": true
}
```

**返回**：
```json
{
  "operation": "query-nodes",
  "hierarchy": {
    "name": "Scene",
    "uuid": "xxx",
    "children": [...]
  }
}
```

---

### query_components

**用途**：查询组件的详细属性和类型信息

**参数**：
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `componentUuid` | string | 必填 | 组件 UUID |
| `includeProperties` | boolean | false | 包含属性值 |
| `includeTooltips` | boolean | false | 包含属性说明 |

**示例**：
```json
{
  "componentUuid": "abc123...",
  "includeProperties": true,
  "includeTooltips": true
}
```

---

### get_available_component_types

**用途**：获取所有可用的组件类型列表

**参数**：
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `category` | string | 全部 | 过滤类别 |

**返回示例**：
```json
{
  "components": [
    "cc.Sprite",
    "cc.Label",
    "cc.Button",
    "cc.RigidBody2D",
    ...
  ]
}
```

---

### get_available_asset_types

**用途**：获取支持的资源类型列表

**参数**：无

**返回**：所有支持的资源类型及其扩展名

---

### get_assets_by_type

**用途**：按类型查询项目中的资源

**参数**：
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `assetType` | string | 必填 | 资源类型（如 "prefab", "texture"） |
| `path` | string | 全项目 | 限制搜索路径 |

**示例**：
```json
{
  "assetType": "prefab",
  "path": "db://assets/prefabs/"
}
```

---

## 创建和修改工具

### create_nodes

**用途**：批量创建节点

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `nodes` | array | 节点定义数组 |
| `parentUuid` | string | 父节点 UUID（可选，默认场景根） |

**节点定义**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 节点类型（见 [NODES.md](NODES.md)） |
| `name` | string | 节点名称 |
| `position` | {x,y,z} | 位置 |
| `eulerAngles` | {x,y,z} | 旋转角度 |
| `scale` | {x,y,z} | 缩放 |
| `components` | string[] | 要添加的组件类型 |
| `prefabUuid` | string | 预制体 UUID（type="Prefab" 时必填） |
| `enabled` | boolean | 是否启用 |
| `layer` | number | 层掩码 |
| `mobility` | string | "Static" / "Stationary" / "Movable" |
| `siblingIndex` | number | 在父节点中的顺序 |

**节点类型**：
- `Empty` — 空节点
- `Prefab` — 从预制体创建（需要 prefabUuid）
- `2D/Sprite`, `2D/Label`, `2D/Graphics` — 2D 节点
- `UI/Button (with Label)`, `UI/ScrollView`, `UI/Layout` — UI 节点
- `3D/Cube`, `3D/Sphere`, `3D/Plane` — 3D 节点
- `Light/Directional`, `Light/Spot` — 光源
- `Camera`, `Terrain`, `ParticleSystem` — 其他

**示例**：
```json
{
  "nodes": [
    {
      "type": "2D/Sprite",
      "name": "Background",
      "position": { "x": 0, "y": 0, "z": 0 }
    },
    {
      "type": "UI/Button (with Label)",
      "name": "StartButton",
      "position": { "x": 0, "y": -100, "z": 0 }
    }
  ]
}
```

**返回**：
```json
{
  "nodes": [
    {
      "uuid": "encoded-uuid",
      "name": "Background",
      "components": [
        { "uuid": "comp-uuid", "type": "cc.Sprite" }
      ]
    }
  ],
  "successCount": 2,
  "totalNodes": 2
}
```

---

### modify_nodes

**用途**：批量修改现有节点

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `nodes` | array | 修改操作数组 |

**节点修改定义**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `uuid` | string | 目标节点 UUID（必填） |
| `properties` | object | 要修改的属性 |
| `addComponents` | string[] | 要添加的组件类型 |
| `removeComponentUuids` | string[] | 要移除的组件 UUID |
| `newParentUuid` | string | 新父节点 UUID |
| `siblingIndex` | number | 新的同级顺序 |
| `deleteNode` | boolean | 是否删除节点 |

**properties 对象**：
- `name`: string
- `position`: {x, y, z}
- `eulerAngles`: {x, y, z}
- `scale`: {x, y, z}
- `enabled`: boolean
- `layer`: number
- `mobility`: "Static" | "Stationary" | "Movable"

**示例**：
```json
{
  "nodes": [
    {
      "uuid": "node-uuid-1",
      "properties": {
        "position": { "x": 100, "y": 200, "z": 0 },
        "scale": { "x": 2, "y": 2, "z": 1 }
      }
    },
    {
      "uuid": "node-uuid-2",
      "addComponents": ["cc.BoxCollider2D"],
      "newParentUuid": "parent-uuid"
    }
  ]
}
```

---

### modify_components

**用途**：精确配置组件属性

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `components` | array | 组件修改数组 |

**组件修改定义**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `uuid` | string | 组件 UUID（必填） |
| `properties` | array | 属性设置数组 |

**属性设置**：
```json
{
  "path": "spriteFrame",
  "type": "cc.SpriteFrame",
  "value": { "uuid": "sprite-frame-uuid" }
}
```

**常用属性路径**：
- Sprite: `spriteFrame`, `color`, `sizeMode`, `type`
- Label: `string`, `fontSize`, `color`, `horizontalAlign`
- Button: `transition`, `normalColor`, `pressedColor`
- RigidBody: `type`, `linearVelocity`, `angularVelocity`

**示例**：
```json
{
  "components": [
    {
      "uuid": "sprite-comp-uuid",
      "properties": [
        {
          "path": "color",
          "type": "cc.Color",
          "value": { "r": 255, "g": 0, "b": 0, "a": 255 }
        }
      ]
    }
  ]
}
```

---

## 资源管理工具

### operate_assets

**用途**：批量资源操作（创建、复制、移动、删除、属性读写）

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `operation` | string | 操作类型 |
| `operationOptions` | array | 操作配置数组 |

**操作类型**：
- `create` — 创建新资源
- `copy` — 复制资源
- `move` — 移动资源
- `delete` — 删除资源
- `get-properties` — 获取资源属性
- `set-properties` — 设置资源属性

**操作配置**：
| 字段 | 用于 | 说明 |
|------|------|------|
| `originalAssetPath` | copy/move/delete/get/set | 源路径 |
| `destinationPath` | create/copy/move | 目标路径 |
| `newAssetType` | create | 资源类型 |
| `overwrite` | create/copy/move | 覆盖已存在 |
| `rename` | create/copy/move | 自动重命名 |
| `properties` | set | 属性数组 |

**可创建的资源类型**：
- `Prefab`, `Scene/Default`, `Scene/2D`, `Scene/Quality`
- `TypeScript`, `Material`, `PhysicsMaterial`
- `AnimationClip`, `AnimationGraph`, `AnimationMask`
- `Effect/LegacyUnlit`, `Effect/SurfaceShader`
- `RenderTexture`, `LabelAtlas`, `AutoAtlas`
- `Folder`

**示例 - 创建 TypeScript**：
```json
{
  "operation": "create",
  "operationOptions": [
    {
      "destinationPath": "db://assets/scripts/PlayerController",
      "newAssetType": "TypeScript"
    }
  ]
}
```

**示例 - 获取属性**：
```json
{
  "operation": "get-properties",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/textures/icon.png",
      "includeTooltips": true
    }
  ]
}
```

---

### operate_current_scene

**用途**：场景生命周期管理

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `action` | string | 操作类型 |
| `scenePath` | string | 场景路径（open 操作需要） |

**操作类型**：
- `open` — 打开场景
- `save` — 保存当前场景
- `get-info` — 获取场景信息
- `get-render-settings` — 获取渲染设置
- `set-render-settings` — 设置渲染设置

**示例**：
```json
{
  "action": "save"
}
```

```json
{
  "action": "open",
  "scenePath": "db://assets/scenes/GameScene.scene"
}
```

---

### operate_prefab_assets

**用途**：预制体工作流管理

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `action` | string | 操作类型 |
| `nodeUuid` | string | 节点 UUID |
| `prefabPath` | string | 预制体保存路径 |

**操作类型**：
- `create` — 从节点创建预制体
- `enter-editing` — 进入预制体编辑模式
- `save-and-close` — 保存并关闭编辑
- `close-without-save` — 不保存关闭

**示例**：
```json
{
  "action": "create",
  "nodeUuid": "node-uuid",
  "prefabPath": "db://assets/prefabs/Enemy.prefab"
}
```

---

### node_linked_prefabs_operations

**用途**：预制体实例操作

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `action` | string | 操作类型 |
| `nodeUuid` | string | 预制体实例节点 UUID |

**操作类型**：
- `enter-editing` — 进入嵌套预制体编辑
- `unwrap` — 取消预制体关联
- `reset` — 重置为预制体默认值

---

## 高级工具

### generate_image_asset

**用途**：生成图像资源（SVG/Emoji 转图像，AI 生成）

**参数**：
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `svgContent` | string | - | SVG 内容或 emoji |
| `prompt` | string | - | AI 生成提示词 |
| `destination` | string | 必填 | 输出路径 |
| `assetType` | string | sprite-frame | 资源类型 |
| `overwrite` | boolean | false | 覆盖已存在 |
| `model` | string | 默认模型 | AI 模型 |
| `steps` | number | 40 | 生成步数 |
| `guidanceScale` | number | 7.5 | 引导强度 |
| `seed` | number | - | 随机种子 |
| `negativePrompt` | string | - | 负面提示词 |
| `tryToRemoveBackground` | boolean | false | 尝试移除背景 |

**三种模式**：
1. **SVG 模式**：只提供 `svgContent`
2. **AI 模式**：只提供 `prompt`
3. **混合模式**：同时提供 `svgContent` 和 `prompt`（SVG 作为模板）

**assetType 选项**：
- `raw` — 原始图像
- `texture` — 纹理
- `normal-map` — 法线贴图
- `sprite-frame` — 精灵帧（默认）
- `texture-cube` — 立方体贴图

**示例 - SVG 转图像**：
```json
{
  "svgContent": "<svg>...</svg>",
  "destination": "db://assets/icons/star.png",
  "assetType": "sprite-frame"
}
```

**示例 - Emoji 转图像**：
```json
{
  "svgContent": "🚀",
  "destination": "db://assets/icons/rocket.png",
  "tryToRemoveBackground": true
}
```

**示例 - AI 生成**：
```json
{
  "prompt": "a cute cartoon cat, pixel art style",
  "destination": "db://assets/sprites/cat.png",
  "model": "sd-v1.5",
  "steps": 50,
  "tryToRemoveBackground": true
}
```

---

### operate_project_settings

**用途**：项目配置管理

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `action` | string | 操作类型 |
| `settings` | object | 设置对象（set 操作） |

**操作类型**：
- `get-layers` — 获取层定义
- `set-layers` — 设置层定义
- `get-collision-matrix` — 获取碰撞矩阵
- `set-collision-matrix` — 设置碰撞矩阵
- `get-design-resolution` — 获取设计分辨率
- `set-design-resolution` — 设置设计分辨率

---

### operate_scripts_and_text

**用途**：文件系统操作（读写脚本和文本文件）

> ⚠️ **安全敏感**：默认禁用，需在配置中启用

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `action` | string | 操作类型 |
| `path` | string | 文件路径 |
| `content` | string | 文件内容（write） |
| `searchPattern` | string | 搜索模式（search） |
| `replaceWith` | string | 替换内容（replace） |

**操作类型**：
- `read` — 读取文件
- `write` — 写入文件
- `search` — 搜索内容
- `replace` — 替换内容

---

### execute_scene_code

**用途**：在场景上下文中执行 TypeScript/JavaScript 代码

> ⚠️ **安全敏感**：默认禁用，需在配置中启用

**参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| `code` | string | 要执行的代码 |

**可用 API**：
- `cc` — Cocos Creator 引擎命名空间
- `cce` — 编辑器扩展 API
- 场景中的所有节点和组件

**示例**：
```json
{
  "code": "const nodes = cc.director.getScene().children; return nodes.map(n => n.name);"
}
```

---

## 错误处理

所有工具返回结构化的错误信息：

```json
{
  "operation": "xxx",
  "errors": [
    "Error message 1",
    "Error message 2"
  ]
}
```

**常见错误**：

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| "No scene loaded" | 未打开场景 | 在 Cocos Creator 中打开场景 |
| "Node not found" | UUID 无效 | 使用 query_nodes 获取有效 UUID |
| "Component not found" | 组件类型错误 | 使用 get_available_component_types 查看正确名称 |
| "Asset not found" | 路径错误 | 检查 db:// 路径格式 |
| "Canvas required" | 2D/UI 节点无 Canvas | 先创建 Canvas |
