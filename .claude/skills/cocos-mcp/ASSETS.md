# Cocos Creator 资源操作指南

本文档提供资源管理的完整指南，覆盖 `operate_assets`、`get_assets_by_type`、`get_available_asset_types` 工具的使用。

---

## 目录

1. [资源路径格式](#资源路径格式)
2. [可创建的资源类型](#可创建的资源类型)
3. [资源操作详解](#资源操作详解)
4. [资源属性读写](#资源属性读写)
5. [常见工作流](#常见工作流)
6. [错误处理](#错误处理)

---

## 资源路径格式

Cocos Creator 使用 `db://` 前缀表示项目资源路径：

```
db://assets/                    # 项目根目录
db://assets/textures/icon.png   # 具体文件
db://assets/prefabs/            # 文件夹
db://internal/                  # 引擎内置资源
```

**注意**：
- 路径区分大小写（Windows 除外）
- 创建资源时通常省略扩展名，系统会自动添加
- 文件夹路径以 `/` 结尾

---

## 可创建的资源类型

使用 `operate_assets` 的 `create` 操作可创建以下资源：

### 场景类

| 类型 | 说明 |
|------|------|
| `Scene/Default` | 默认 3D 场景 |
| `Scene/2D` | 2D 场景 |
| `Scene/Quality` | 高质量场景 |

### 预制体

| 类型 | 说明 |
|------|------|
| `Prefab` | 空预制体（通常从节点创建更好） |

### 脚本

| 类型 | 说明 |
|------|------|
| `TypeScript` | TypeScript 组件脚本 |

### 材质和着色器

| 类型 | 说明 |
|------|------|
| `Material` | 材质 |
| `PhysicsMaterial` | 物理材质 |
| `Effect/LegacyUnlit` | 无光照效果 |
| `Effect/SurfaceShader` | 表面着色器 |

### 动画

| 类型 | 说明 |
|------|------|
| `AnimationClip` | 动画片段 |
| `AnimationGraph` | 动画图 |
| `AnimationMask` | 动画遮罩 |

### 纹理

| 类型 | 说明 |
|------|------|
| `RenderTexture` | 渲染纹理 |
| `LabelAtlas` | 标签图集 |
| `AutoAtlas` | 自动图集 |

### 其他

| 类型 | 说明 |
|------|------|
| `Folder` | 文件夹 |

**创建示例**：
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

---

## 资源操作详解

### create — 创建资源

```json
{
  "operation": "create",
  "operationOptions": [
    {
      "destinationPath": "db://assets/materials/NewMaterial",
      "newAssetType": "Material",
      "overwrite": false,
      "rename": true
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `destinationPath` | 目标路径（不含扩展名） |
| `newAssetType` | 资源类型 |
| `overwrite` | 覆盖已存在的资源 |
| `rename` | 自动重命名避免冲突 |

### copy — 复制资源

```json
{
  "operation": "copy",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/textures/icon.png",
      "destinationPath": "db://assets/textures/icon_copy.png",
      "overwrite": false
    }
  ]
}
```

### move — 移动/重命名资源

```json
{
  "operation": "move",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/old/file.ts",
      "destinationPath": "db://assets/new/file.ts"
    }
  ]
}
```

### delete — 删除资源

```json
{
  "operation": "delete",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/unused/old-asset.prefab"
    }
  ]
}
```

**警告**：删除操作不可撤销，请谨慎使用。

---

## 资源属性读写

### get-properties — 获取资源属性

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

返回资源的所有可配置属性和当前值。

### set-properties — 设置资源属性

```json
{
  "operation": "set-properties",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/textures/icon.png",
      "properties": [
        {
          "path": "userData.wrapModeS",
          "value": 0
        },
        {
          "path": "userData.filterMin",
          "value": 2
        }
      ]
    }
  ]
}
```

### 常见资源属性

#### 纹理 (Texture)

| 属性路径 | 说明 | 可选值 |
|----------|------|--------|
| `userData.wrapModeS` | 水平包裹模式 | 0=重复, 1=钳制, 2=镜像 |
| `userData.wrapModeT` | 垂直包裹模式 | 同上 |
| `userData.filterMin` | 缩小过滤 | 0=点采样, 1=双线性, 2=三线性 |
| `userData.filterMag` | 放大过滤 | 同上 |
| `userData.premultiplyAlpha` | 预乘 Alpha | true/false |
| `userData.packable` | 可打包入图集 | true/false |

#### 精灵帧 (SpriteFrame)

| 属性路径 | 说明 |
|----------|------|
| `userData.trimType` | 裁剪类型 |
| `userData.trimThreshold` | 裁剪阈值 |
| `userData.rotated` | 是否旋转 |
| `userData.offsetX` | X 偏移 |
| `userData.offsetY` | Y 偏移 |
| `userData.borderTop` | 九宫格上边 |
| `userData.borderBottom` | 九宫格下边 |
| `userData.borderLeft` | 九宫格左边 |
| `userData.borderRight` | 九宫格右边 |

#### 音频 (AudioClip)

| 属性路径 | 说明 |
|----------|------|
| `userData.loadMode` | 加载模式 |

---

## 查询资源

### get_available_asset_types

获取所有支持的资源类型列表：

```json
// 无参数
{}
```

返回：
```json
{
  "assetTypes": [
    { "type": "cc.Prefab", "extensions": [".prefab"] },
    { "type": "cc.Scene", "extensions": [".scene"] },
    { "type": "cc.Texture2D", "extensions": [".png", ".jpg", ".jpeg", ".webp"] },
    { "type": "cc.AudioClip", "extensions": [".mp3", ".ogg", ".wav"] },
    ...
  ]
}
```

### get_assets_by_type

按类型查找项目资源：

```json
{
  "assetType": "prefab",
  "path": "db://assets/prefabs/"
}
```

| 参数 | 说明 |
|------|------|
| `assetType` | 资源类型（不区分大小写） |
| `path` | 限制搜索范围（可选） |

**常用 assetType 值**：
- `prefab` — 预制体
- `scene` — 场景
- `texture` — 纹理
- `sprite-frame` — 精灵帧
- `audio-clip` — 音频
- `animation-clip` — 动画片段
- `material` — 材质
- `effect` — 着色器效果
- `typescript` — TypeScript 脚本
- `font` — 字体
- `json` — JSON 数据
- `text` — 文本文件

---

## 常见工作流

### 1. 创建脚本文件

```json
{
  "operation": "create",
  "operationOptions": [
    {
      "destinationPath": "db://assets/scripts/GameManager",
      "newAssetType": "TypeScript"
    }
  ]
}
```

创建后使用 `operate_scripts_and_text` 编写代码内容。

### 2. 组织资源目录

```json
{
  "operation": "create",
  "operationOptions": [
    { "destinationPath": "db://assets/textures/", "newAssetType": "Folder" },
    { "destinationPath": "db://assets/prefabs/", "newAssetType": "Folder" },
    { "destinationPath": "db://assets/scripts/", "newAssetType": "Folder" },
    { "destinationPath": "db://assets/audio/", "newAssetType": "Folder" }
  ]
}
```

### 3. 批量资源操作

```json
{
  "operation": "move",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/old-sprites/icon1.png",
      "destinationPath": "db://assets/sprites/icon1.png"
    },
    {
      "originalAssetPath": "db://assets/old-sprites/icon2.png",
      "destinationPath": "db://assets/sprites/icon2.png"
    }
  ]
}
```

### 4. 配置纹理导入设置

```json
{
  "operation": "set-properties",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/textures/pixel-art.png",
      "properties": [
        { "path": "userData.filterMin", "value": 0 },
        { "path": "userData.filterMag", "value": 0 },
        { "path": "userData.packable", "value": false }
      ]
    }
  ]
}
```

### 5. 查找并配置所有预制体

```
1. 使用 get_assets_by_type(assetType="prefab") 获取所有预制体
2. 遍历结果，使用 get-properties 查看属性
3. 使用 set-properties 批量配置
```

---

## 与图像生成配合

生成图像后自动成为项目资源：

```json
// 1. 生成图像
{
  "prompt": "a cute cartoon cat",
  "destination": "db://assets/sprites/cat.png",
  "assetType": "sprite-frame"
}

// 2. 配置精灵帧九宫格
{
  "operation": "set-properties",
  "operationOptions": [{
    "originalAssetPath": "db://assets/sprites/cat.png",
    "properties": [
      { "path": "userData.borderTop", "value": 10 },
      { "path": "userData.borderBottom", "value": 10 },
      { "path": "userData.borderLeft", "value": 10 },
      { "path": "userData.borderRight", "value": 10 }
    ]
  }]
}

// 3. 将资源应用到节点
{
  "components": [{
    "uuid": "sprite-comp-uuid",
    "properties": [{
      "path": "spriteFrame",
      "type": "cc.SpriteFrame",
      "value": { "uuid": "generated-sprite-frame-uuid" }
    }]
  }]
}
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| "Asset not found" | 路径错误或资源不存在 | 检查 `db://` 路径格式 |
| "Asset already exists" | 目标路径已有资源 | 使用 `overwrite: true` 或 `rename: true` |
| "Invalid asset type" | 不支持的资源类型 | 使用 `get_available_asset_types` 查看支持类型 |
| "Permission denied" | 资源被锁定 | 关闭编辑器中正在编辑的资源 |
| "Parent folder not found" | 父目录不存在 | 先创建父文件夹 |

### 批量操作部分失败

批量操作会尽可能执行所有项目，返回结果包含每个操作的成功/失败状态：

```json
{
  "results": [
    { "path": "...", "success": true },
    { "path": "...", "success": false, "error": "Asset not found" }
  ],
  "successCount": 1,
  "failureCount": 1
}
```

---

## 最佳实践

1. **先查询后操作** — 使用 `get_assets_by_type` 确认资源存在
2. **使用 rename** — 创建时启用 `rename: true` 避免覆盖
3. **批量操作** — 多个操作合并到一次调用
4. **组织目录** — 先创建文件夹结构，再创建资源
5. **备份重要资源** — 删除前先复制到备份位置
