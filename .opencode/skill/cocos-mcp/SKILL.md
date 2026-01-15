---
name: cocos-mcp
description: Build games in Cocos Creator using MCP tools. Covers scene creation, node management, component configuration, asset operations, and AI image generation. Use when working with Cocos Creator game development tasks.
allowed-tools: create_nodes, modify_nodes, query_nodes, query_components, modify_components, operate_assets, operate_current_scene, operate_prefab_assets, node_linked_prefabs_operations, get_available_component_types, get_available_asset_types, get_assets_by_type, generate_image_asset, operate_project_settings, operate_scripts_and_text, execute_scene_code
---

# Cocos Creator MCP 使用指南

## 概述

本 Skill 提供使用 Cocos Creator MCP Server 进行游戏开发的完整指南。MCP Server 运行在 `http://localhost:3000/mcp`，提供 16 个核心工具用于操作 Cocos Creator 编辑器。

## 快速开始

### 前置条件

1. Cocos Creator 编辑器已打开项目
2. MCP Server 已启动（Panel → cocos-mcp → MCP Server Control Panel → Start）

### 基本工作流

```
1. 查询当前场景结构 → query_nodes
2. 创建节点 → create_nodes
3. 修改节点属性 → modify_nodes
4. 配置组件 → modify_components
5. 保存场景 → operate_current_scene (action: "save")
```

## 核心概念

### UUID 编码

所有工具返回的 UUID 都经过 Base64 编码处理（如果包含 `@` 字符）。使用时直接传入编码后的 UUID，工具会自动解码。

### Canvas 规则

- **2D 节点**（Sprite, Label, Graphics 等）必须在 Canvas 下
- **UI 节点**（Button, ScrollView, Layout 等）必须在 Canvas 下
- **3D 节点**（Cube, Sphere, Camera 等）直接放在场景根节点下
- 使用 `create_nodes` 创建 2D/UI 节点时，会自动创建 Canvas（如果不存在）

### 层级管理

- 使用 `parentUuid` 指定父节点
- 使用 `siblingIndex` 控制同级顺序
- 省略 `parentUuid` 默认创建在场景根节点下

## 工具速查表

| 工具 | 用途 | 常用场景 |
|------|------|----------|
| `query_nodes` | 查询场景层次结构 | 了解场景布局、获取节点 UUID |
| `create_nodes` | 批量创建节点 | 创建游戏对象、UI 元素 |
| `modify_nodes` | 修改节点属性 | 调整位置、缩放、层级 |
| `query_components` | 查询组件属性 | 了解组件可配置项 |
| `modify_components` | 配置组件属性 | 设置 Sprite 图片、Button 事件 |
| `operate_assets` | 资源操作 | 创建、复制、移动、删除资源 |
| `operate_current_scene` | 场景操作 | 打开、保存、获取场景信息 |
| `operate_prefab_assets` | 预制体操作 | 创建、编辑预制体 |
| `get_available_component_types` | 获取组件类型列表 | 查看可用组件 |
| `get_available_asset_types` | 获取资源类型列表 | 查看支持的资源类型 |
| `get_assets_by_type` | 按类型查询资源 | 查找特定类型资源 |
| `generate_image_asset` | AI 生成图像资源 | 从 SVG/文本生成游戏素材 |
| `operate_project_settings` | 项目设置 | 配置层、碰撞矩阵、分辨率 |
| `operate_scripts_and_text` | 文件操作 | 读写代码文件 |
| `execute_scene_code` | 执行场景代码 | 运行自定义脚本 |
| `node_linked_prefabs_operations` | 预制体实例操作 | 编辑、取消关联预制体 |

## 详细文档

- [工具详细用法](TOOLS.md) — 每个工具的完整参数说明和示例
- [节点类型参考](NODES.md) — 可创建的节点类型列表
- [组件参考](COMPONENTS.md) — 常用组件及其属性
- [资源操作](ASSETS.md) — 资源管理详细指南

## 常见工作流

### 创建 2D 游戏场景

```
1. query_nodes(maxDepth=1) — 查看场景根节点
2. create_nodes(type="UI/Canvas") — 创建 Canvas（如果没有）
3. create_nodes(type="2D/Sprite", parentUuid=canvas_uuid) — 创建背景精灵
4. create_nodes(type="2D/Label") — 创建文字
5. operate_current_scene(action="save") — 保存场景
```

### 创建 3D 场景

```
1. create_nodes(type="Camera") — 创建摄像机
2. create_nodes(type="Light/Directional") — 创建方向光
3. create_nodes(type="3D/Cube") — 创建 3D 物体
4. modify_nodes — 调整位置和缩放
```

### 创建 UI 界面

```
1. create_nodes(type="UI/Canvas") — 创建 Canvas
2. create_nodes(type="UI/Button (with Label)") — 创建按钮
3. create_nodes(type="UI/Layout") — 创建布局容器
4. modify_components — 配置布局属性
```

## 错误排查

### "No scene loaded"
- 确保 Cocos Creator 中已打开一个场景

### "Invalid UUID"
- 使用 `query_nodes` 获取有效的节点 UUID
- UUID 可能已失效（节点被删除）

### "Canvas required" 
- 2D/UI 节点需要 Canvas 祖先
- 先创建 Canvas 再创建 UI 元素

### "Component not found"
- 使用 `get_available_component_types` 查看正确的组件名称
- 组件名需要完整（如 `cc.Sprite` 而非 `Sprite`）

## 最佳实践

1. **先查询后操作** — 使用 `query_nodes` 了解当前场景结构
2. **批量操作** — `create_nodes` 和 `modify_nodes` 支持数组，减少调用次数
3. **保存场景** — 重要修改后调用 `operate_current_scene(action="save")`
4. **使用快照** — 工具会自动创建快照，支持编辑器撤销（Ctrl+Z）
5. **组件配置** — 先创建节点，再用 `modify_components` 配置组件属性
