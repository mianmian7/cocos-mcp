---
name: scene-builder
description: Build complete game scenes in Cocos Creator. Use for creating 2D/3D game levels, UI layouts, and scene hierarchies from scratch.
allowed-tools: create_nodes, modify_nodes, query_nodes, modify_components, operate_current_scene
---

# 场景构建工作流

本 Skill 提供在 Cocos Creator 中构建完整游戏场景的步骤指南。

---

## 快速开始

### 2D 游戏场景

```
步骤 1: 查询场景 → query_nodes(maxDepth=1)
步骤 2: 创建 Canvas → create_nodes(type="UI/Canvas")
步骤 3: 创建背景 → create_nodes(type="2D/Sprite", name="Background")
步骤 4: 创建 UI → create_nodes(type="UI/Button (with Label)")
步骤 5: 保存场景 → operate_current_scene(action="save")
```

### 3D 游戏场景

```
步骤 1: 创建相机 → create_nodes(type="Camera")
步骤 2: 创建光源 → create_nodes(type="Light/Directional")
步骤 3: 创建地面 → create_nodes(type="3D/Plane")
步骤 4: 创建物体 → create_nodes(type="3D/Cube")
步骤 5: 保存场景 → operate_current_scene(action="save")
```

---

## 完整工作流

### 第一步：了解当前场景

```json
{
  "maxDepth": 1,
  "includeProperties": false
}
```

检查场景是否已有内容，获取根节点信息。

### 第二步：规划场景结构

**2D/UI 场景推荐结构**：
```
Scene (场景根)
├── Canvas (UI 画布)
│   ├── Background (背景层)
│   ├── GameLayer (游戏层)
│   │   ├── Player
│   │   └── Enemies
│   └── UILayer (UI 层)
│       ├── HUD
│       └── Popup
└── Managers (管理器)
    ├── GameManager
    └── AudioManager
```

**3D 场景推荐结构**：
```
Scene (场景根)
├── Environment
│   ├── Main Camera
│   ├── Directional Light
│   └── Ground
├── GameObjects
│   ├── Player
│   └── Enemies
└── UI (可选，用 Canvas)
```

### 第三步：创建基础结构

**2D 场景**：
```json
{
  "nodes": [
    { "type": "UI/Canvas", "name": "Canvas" }
  ]
}
```

**3D 场景**：
```json
{
  "nodes": [
    { 
      "type": "Camera", 
      "name": "Main Camera",
      "position": { "x": 0, "y": 5, "z": 10 }
    },
    {
      "type": "Light/Directional",
      "name": "Main Light",
      "eulerAngles": { "x": -45, "y": 45, "z": 0 }
    }
  ]
}
```

### 第四步：添加游戏元素

获取 Canvas UUID 后，在其下创建元素：

```json
{
  "nodes": [
    {
      "type": "2D/Sprite",
      "name": "Background",
      "position": { "x": 0, "y": 0, "z": 0 }
    },
    {
      "type": "2D/Sprite",
      "name": "Player",
      "position": { "x": 0, "y": -200, "z": 0 }
    }
  ],
  "parentUuid": "<canvas-uuid>"
}
```

### 第五步：配置组件

使用 `modify_components` 配置精灵、按钮等：

```json
{
  "components": [
    {
      "uuid": "<sprite-component-uuid>",
      "properties": [
        {
          "path": "spriteFrame",
          "type": "cc.SpriteFrame",
          "value": { "uuid": "<sprite-frame-asset-uuid>" }
        }
      ]
    }
  ]
}
```

### 第六步：组织层级

使用 `modify_nodes` 调整节点关系：

```json
{
  "nodes": [
    {
      "uuid": "<node-uuid>",
      "newParentUuid": "<new-parent-uuid>",
      "siblingIndex": 0
    }
  ]
}
```

### 第七步：保存场景

```json
{ "action": "save" }
```

---

## 场景类型模板

### 主菜单场景

```json
{
  "nodes": [
    { "type": "UI/Canvas", "name": "Canvas" },
    { "type": "2D/Sprite", "name": "Background" },
    { "type": "2D/Label", "name": "Title" },
    { "type": "UI/Button (with Label)", "name": "StartBtn" },
    { "type": "UI/Button (with Label)", "name": "SettingsBtn" },
    { "type": "UI/Button (with Label)", "name": "QuitBtn" }
  ]
}
```

### 横版游戏场景

```json
{
  "nodes": [
    { "type": "UI/Canvas", "name": "Canvas" },
    { "type": "2D/Sprite", "name": "Background" },
    { "type": "Empty", "name": "GameLayer" },
    { "type": "Empty", "name": "UILayer" }
  ]
}
```

后续在 GameLayer 下添加：Player、Enemies、Platforms
在 UILayer 下添加：ScoreLabel、HealthBar

### 3D 探索场景

```json
{
  "nodes": [
    { 
      "type": "Camera", 
      "name": "MainCamera",
      "position": { "x": 0, "y": 2, "z": 5 }
    },
    {
      "type": "Light/Directional",
      "name": "Sun",
      "eulerAngles": { "x": -30, "y": 30, "z": 0 }
    },
    {
      "type": "3D/Plane",
      "name": "Ground",
      "scale": { "x": 20, "y": 1, "z": 20 }
    },
    {
      "type": "3D/Cube",
      "name": "Player",
      "position": { "x": 0, "y": 0.5, "z": 0 }
    }
  ]
}
```

---

## UI 布局技巧

### 使用 Layout 组件

创建按钮组：

```json
{
  "nodes": [
    {
      "type": "Empty",
      "name": "ButtonGroup",
      "components": ["cc.Layout"]
    }
  ]
}
```

配置 Layout：

```json
{
  "components": [{
    "uuid": "<layout-uuid>",
    "properties": [
      { "path": "type", "value": 2 },
      { "path": "spacingY", "value": 20 },
      { "path": "paddingTop", "value": 10 },
      { "path": "paddingBottom", "value": 10 }
    ]
  }]
}
```

### 使用 Widget 对齐

全屏背景：

```json
{
  "nodes": [{
    "type": "2D/Sprite",
    "name": "Background",
    "components": ["cc.Widget"]
  }]
}
```

配置 Widget：

```json
{
  "components": [{
    "uuid": "<widget-uuid>",
    "properties": [
      { "path": "isAlignTop", "value": true },
      { "path": "isAlignBottom", "value": true },
      { "path": "isAlignLeft", "value": true },
      { "path": "isAlignRight", "value": true },
      { "path": "top", "value": 0 },
      { "path": "bottom", "value": 0 },
      { "path": "left", "value": 0 },
      { "path": "right", "value": 0 }
    ]
  }]
}
```

---

## 注意事项

### Canvas 规则
- 2D/UI 节点必须在 Canvas 下
- `create_nodes` 会自动创建 Canvas（如果需要）
- 3D 节点直接放在场景根下

### 层级顺序
- 子节点顺序决定渲染顺序
- 后面的节点渲染在前面
- 使用 `siblingIndex` 控制顺序

### 性能考虑
- 批量创建节点更高效
- 合理组织层级减少 draw call
- 使用 `query_nodes(maxDepth=1)` 避免大量数据

---

## 常见问题

### 节点不可见
1. 检查 `enabled` 是否为 true
2. 检查 `position` 是否在可视范围
3. 2D 节点检查是否在 Canvas 下
4. 检查层级顺序（是否被遮挡）

### 组件配置无效
1. 使用 `query_components` 确认属性路径
2. 检查属性类型是否正确
3. 资源引用需要正确的 UUID

### 场景保存失败
1. 确保场景已打开
2. 检查是否有未保存的预制体编辑
