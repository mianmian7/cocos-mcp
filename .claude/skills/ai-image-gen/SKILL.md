---
name: ai-image-gen
description: Generate game assets using AI image generation and SVG/Emoji conversion. Use this skill when creating sprites, icons, textures, or other visual assets.
allowed-tools: generate_image_asset, operate_assets, modify_components
---

# AI 图像生成工作流

本 Skill 指导如何使用 MCP 的 AI 图像生成功能创建游戏素材。

---

## 三种生成模式

| 模式 | 使用场景 | 参数 |
|------|----------|------|
| **SVG/Emoji** | 简单图标、emoji 转图像 | 仅 `svgContent` |
| **AI 生成** | 复杂角色、场景素材 | 仅 `prompt` |
| **混合模式** | AI 增强 SVG 模板 | `svgContent` + `prompt` |

---

## SVG/Emoji 模式

### Emoji 转精灵

快速将 emoji 转换为游戏可用的精灵：

```json
{
  "svgContent": "🚀",
  "destination": "db://assets/sprites/rocket.png",
  "assetType": "sprite-frame",
  "tryToRemoveBackground": true
}
```

### 常用游戏 Emoji

| Emoji | 用途 |
|-------|------|
| 🎮 ⭐ ❤️ 💎 🔥 | 通用图标 |
| ⚔️ 🛡️ 🏹 🗡️ 💣 | 武器/战斗 |
| 🏠 🏰 🏭 🏪 🌲 | 建筑/环境 |
| 👤 👹 🐉 🦊 🐱 | 角色/怪物 |
| 🍎 🍖 💊 📦 🔑 | 道具/物品 |

### SVG 转精灵

使用自定义 SVG 创建精确图形：

```json
{
  "svgContent": "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><circle cx='32' cy='32' r='30' fill='gold' stroke='orange' stroke-width='2'/></svg>",
  "destination": "db://assets/sprites/coin.png",
  "assetType": "sprite-frame"
}
```

---

## AI 生成模式

### 基本用法

```json
{
  "prompt": "a cute cartoon cat character, game sprite style, transparent background",
  "destination": "db://assets/sprites/cat.png",
  "assetType": "sprite-frame",
  "tryToRemoveBackground": true
}
```

### 提示词最佳实践

**结构**：主体 + 风格 + 技术要求

```
[主体描述] + [艺术风格] + [技术规格]
```

**示例**：

| 类型 | 提示词示例 |
|------|------------|
| 角色 | "cute warrior knight character, chibi anime style, facing right, transparent background" |
| 道具 | "golden treasure chest, pixel art style, isometric view, transparent background" |
| 图标 | "fire spell icon, glossy 3D style, circular shape, dark background" |
| 背景 | "fantasy forest landscape, painterly style, 16:9 aspect ratio" |
| UI | "wooden game button, medieval fantasy style, rectangular shape" |

### 风格关键词

| 风格 | 关键词 |
|------|--------|
| 像素艺术 | pixel art, 8-bit, retro, pixelated |
| 卡通 | cartoon, anime, chibi, hand-drawn |
| 写实 | realistic, photorealistic, detailed |
| 扁平 | flat design, minimalist, vector art |
| 3D | 3D render, low poly, isometric |

### 负面提示词

使用 `negativePrompt` 排除不想要的元素：

```json
{
  "prompt": "game character sprite",
  "negativePrompt": "blurry, watermark, text, logo, low quality",
  "destination": "db://assets/sprites/character.png"
}
```

---

## 高级参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `model` | 默认模型 | AI 模型选择 |
| `steps` | 40 | 生成步数（越高越精细） |
| `guidanceScale` | 7.5 | 提示词遵循程度（越高越忠实） |
| `seed` | 随机 | 随机种子（固定可复现） |
| `tryToRemoveBackground` | false | 尝试移除背景 |

### 参数调优建议

| 场景 | steps | guidanceScale |
|------|-------|---------------|
| 快速预览 | 20 | 7 |
| 标准质量 | 40 | 7.5 |
| 高质量 | 60+ | 8-10 |
| 创意发散 | 40 | 5-6 |
| 精确控制 | 40 | 10-12 |

---

## 资源类型选择

| assetType | 用途 |
|-----------|------|
| `sprite-frame` | 2D 精灵（默认，最常用） |
| `texture` | 3D 纹理、材质贴图 |
| `normal-map` | 法线贴图 |
| `raw` | 原始图像文件 |

---

## 完整工作流示例

### 1. 创建游戏角色

```json
// Step 1: 生成角色图像
{
  "prompt": "pixel art knight character, side view, walk cycle frame 1, 64x64 pixels, transparent background",
  "destination": "db://assets/sprites/knight.png",
  "assetType": "sprite-frame",
  "steps": 50,
  "tryToRemoveBackground": true
}
```

```json
// Step 2: 应用到精灵节点
// 先查询获取节点和组件 UUID
{
  "components": [
    {
      "uuid": "sprite-comp-uuid",
      "properties": [
        {
          "path": "spriteFrame",
          "type": "cc.SpriteFrame",
          "value": { "uuid": "generated-sprite-frame-uuid" }
        }
      ]
    }
  ]
}
```

### 2. 批量生成 UI 图标

```json
// 生成多个图标（需要多次调用）
// 攻击图标
{
  "prompt": "sword slash attack icon, game UI, red energy effect, circular frame",
  "destination": "db://assets/ui/icons/attack.png",
  "assetType": "sprite-frame"
}

// 防御图标
{
  "prompt": "shield defense icon, game UI, blue glow effect, circular frame",
  "destination": "db://assets/ui/icons/defense.png",
  "assetType": "sprite-frame"
}

// 治疗图标
{
  "prompt": "healing magic icon, game UI, green cross, circular frame",
  "destination": "db://assets/ui/icons/heal.png",
  "assetType": "sprite-frame"
}
```

### 3. 创建 UI 背景

```json
{
  "prompt": "fantasy game menu background, dark blue gradient, subtle magical particles, 1920x1080",
  "destination": "db://assets/ui/backgrounds/menu-bg.png",
  "assetType": "sprite-frame",
  "steps": 60
}
```

---

## 生成后处理

### 配置九宫格

对于按钮、面板等需要拉伸的元素：

```json
{
  "operation": "set-properties",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/ui/button.png",
      "properties": [
        { "path": "userData.borderTop", "value": 10 },
        { "path": "userData.borderBottom", "value": 10 },
        { "path": "userData.borderLeft", "value": 10 },
        { "path": "userData.borderRight", "value": 10 }
      ]
    }
  ]
}
```

### 配置纹理设置

对于像素艺术风格，禁用过滤：

```json
{
  "operation": "set-properties",
  "operationOptions": [
    {
      "originalAssetPath": "db://assets/sprites/pixel-sprite.png",
      "properties": [
        { "path": "userData.filterMin", "value": 0 },
        { "path": "userData.filterMag", "value": 0 }
      ]
    }
  ]
}
```

---

## 混合模式

使用 SVG 作为布局模板，AI 增强细节：

```json
{
  "svgContent": "<svg width='128' height='128'><rect x='16' y='16' width='96' height='96' rx='8' fill='#4a4a4a'/></svg>",
  "prompt": "add metallic texture and rivets to this button, game UI style",
  "destination": "db://assets/ui/metal-button.png",
  "assetType": "sprite-frame"
}
```

---

## 常见问题

### 背景移除不完整

- 增加 `tryToRemoveBackground: true`
- 在 prompt 中强调 "transparent background"
- 使用纯色背景（如 "green screen background"）后手动处理

### 图像模糊

- 增加 `steps` 值（50-80）
- 在 prompt 中添加 "sharp, detailed, high quality"

### 风格不一致

- 固定 `seed` 值
- 使用相同的风格描述词
- 批量生成时保持相同的参数

### 尺寸问题

- 在 prompt 中指定尺寸（如 "64x64 pixels"）
- 生成后在 Cocos Creator 中调整 UITransform 尺寸

---

## 最佳实践

1. **明确风格** — 保持项目内素材风格一致
2. **批量规划** — 先规划需要的素材清单
3. **固定种子** — 满意的效果记录 seed 便于复现
4. **透明背景** — 游戏精灵总是请求透明背景
5. **合理步数** — 预览用低步数，最终用高步数
6. **组织资源** — 按类型分文件夹存放生成的资源
