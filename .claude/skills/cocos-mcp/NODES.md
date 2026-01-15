# Cocos Creator 节点类型参考

本文档列出 `create_nodes` 工具支持的所有节点类型。

---

## 目录

1. [基础节点](#基础节点)
2. [2D 节点](#2d-节点)
3. [UI 节点](#ui-节点)
4. [3D 节点](#3d-节点)
5. [光源](#光源)
6. [其他节点](#其他节点)

---

## 基础节点

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `Empty` | 空节点，用于组织层级 | 无 |
| `Prefab` | 预制体实例 | 取决于预制体（需要 `prefabUuid`） |

---

## 2D 节点

> ⚠️ **注意**：2D 节点必须放在 Canvas 下才能正确渲染

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `2D/Sprite` | 精灵，显示图片 | UITransform, Sprite |
| `2D/Label` | 文字标签 | UITransform, Label |
| `2D/Graphics` | 矢量绘图 | UITransform, Graphics |
| `2D/Mask` | 遮罩 | UITransform, Mask |
| `2D/ParticleSystem2D` | 2D 粒子系统 | UITransform, ParticleSystem2D |
| `2D/SpineSkeleton` | Spine 骨骼动画 | UITransform, Spine |
| `2D/TiledMap` | 瓦片地图 | UITransform, TiledMap |
| `2D/TiledLayer` | 瓦片图层 | UITransform, TiledLayer |

### 2D/Sprite 常用配置

```json
{
  "type": "2D/Sprite",
  "name": "Background",
  "position": { "x": 0, "y": 0, "z": 0 }
}
```

配置精灵图：使用 `modify_components` 设置 `spriteFrame` 属性

### 2D/Label 常用配置

```json
{
  "type": "2D/Label",
  "name": "Title"
}
```

配置文字：使用 `modify_components` 设置 `string`、`fontSize`、`color` 等属性

---

## UI 节点

> ⚠️ **注意**：UI 节点必须放在 Canvas 下

### 容器类

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `UI/Canvas` | UI 画布容器 | Canvas, UITransform |
| `UI/Layout` | 布局容器 | UITransform, Layout |
| `UI/ScrollView` | 滚动视图 | UITransform, ScrollView |
| `UI/PageView` | 分页视图 | UITransform, PageView |
| `UI/Widget` | 锚点/对齐组件 | UITransform, Widget |
| `UI/SafeArea` | 安全区域适配 | UITransform, SafeArea |
| `UI/UICoordinateTracker` | 坐标跟踪器 | UITransform, UICoordinateTracker |

### 交互类

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `UI/Button (with Label)` | 按钮（带文字） | UITransform, Button, Sprite + 子 Label |
| `UI/Toggle` | 开关/复选框 | UITransform, Toggle |
| `UI/ToggleContainer` | 单选组容器 | UITransform, ToggleContainer |
| `UI/Slider` | 滑动条 | UITransform, Slider |
| `UI/ProgressBar` | 进度条 | UITransform, ProgressBar |
| `UI/EditBox` | 输入框 | UITransform, EditBox |
| `UI/RichText` | 富文本 | UITransform, RichText |

### UI/Button 创建示例

```json
{
  "type": "UI/Button (with Label)",
  "name": "StartButton",
  "position": { "x": 0, "y": -100, "z": 0 }
}
```

这会创建：
- Button 节点（带 Button 和 Sprite 组件）
- 子 Label 节点（带 Label 组件）

### UI/ScrollView 结构

创建后的结构：
```
ScrollView
├── view (遮罩区域)
│   └── content (内容容器)
├── scrollbar-h (可选)
└── scrollbar-v (可选)
```

### UI/Layout 布局类型

创建后使用 `modify_components` 设置：
- `type`: 0=无, 1=水平, 2=垂直, 3=网格
- `resizeMode`: 0=无, 1=容器, 2=子节点
- `spacingX`, `spacingY`: 间距

---

## 3D 节点

> 3D 节点直接放在场景根节点下，无需 Canvas

### 基础几何体

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `3D/Cube` | 立方体 | MeshRenderer (BoxMesh) |
| `3D/Sphere` | 球体 | MeshRenderer (SphereMesh) |
| `3D/Cylinder` | 圆柱体 | MeshRenderer (CylinderMesh) |
| `3D/Capsule` | 胶囊体 | MeshRenderer (CapsuleMesh) |
| `3D/Cone` | 圆锥体 | MeshRenderer (ConeMesh) |
| `3D/Plane` | 平面 | MeshRenderer (PlaneMesh) |
| `3D/Quad` | 四边形 | MeshRenderer (QuadMesh) |
| `3D/Torus` | 圆环 | MeshRenderer (TorusMesh) |

### 3D 示例

```json
{
  "type": "3D/Cube",
  "name": "Ground",
  "position": { "x": 0, "y": -1, "z": 0 },
  "scale": { "x": 10, "y": 0.1, "z": 10 }
}
```

---

## 光源

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `Light/Directional` | 方向光（太阳光） | DirectionalLight |
| `Light/Sphere` | 球形点光源 | SphereLight |
| `Light/Spot` | 聚光灯 | SpotLight |
| `Light/Point` | 点光源 | PointLight |
| `Light/RangedDirectional` | 范围方向光 | RangedDirectionalLight |

### 基础 3D 场景设置

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
    },
    {
      "type": "3D/Plane",
      "name": "Ground",
      "scale": { "x": 10, "y": 1, "z": 10 }
    }
  ]
}
```

---

## 其他节点

| 类型 | 说明 | 默认组件 |
|------|------|----------|
| `Camera` | 摄像机 | Camera |
| `Terrain` | 地形 | Terrain |
| `ParticleSystem` | 3D 粒子系统 | ParticleSystem |
| `Billboard` | 始终面向相机 | Billboard |
| `Line` | 3D 线段 | Line |
| `LOD` | 多细节层次 | LODGroup |
| `ReflectionProbe` | 反射探针 | ReflectionProbe |
| `PlayableDirector` | 时间轴播放器 | PlayableDirector |

---

## 使用建议

### Canvas 规则汇总

| 节点类别 | 需要 Canvas | 说明 |
|----------|-------------|------|
| 2D/* | ✅ 是 | 必须在 Canvas 下 |
| UI/* | ✅ 是 | 必须在 Canvas 下 |
| 3D/* | ❌ 否 | 直接放场景根 |
| Light/* | ❌ 否 | 直接放场景根 |
| Camera | ❌ 否 | 直接放场景根 |

### 批量创建

`create_nodes` 支持数组，一次创建多个节点更高效：

```json
{
  "nodes": [
    { "type": "UI/Canvas", "name": "Canvas" },
    { "type": "2D/Sprite", "name": "BG" },
    { "type": "2D/Label", "name": "Title" },
    { "type": "UI/Button (with Label)", "name": "Start" },
    { "type": "UI/Button (with Label)", "name": "Settings" }
  ]
}
```

### 层级组织

使用 `parentUuid` 组织节点层级：

```
1. 先创建父节点，获取其 UUID
2. 再创建子节点，指定 parentUuid
```

或使用 `modify_nodes` 的 `newParentUuid` 重新组织。
