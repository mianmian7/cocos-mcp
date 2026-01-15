# Cocos Creator 组件参考

本文档提供常用组件的属性参考，用于 `modify_components` 工具配置。

---

## 目录

1. [渲染组件](#渲染组件)
2. [UI 组件](#ui-组件)
3. [布局组件](#布局组件)
4. [物理组件](#物理组件)
5. [动画组件](#动画组件)
6. [音频组件](#音频组件)
7. [其他组件](#其他组件)

---

## 渲染组件

### cc.Sprite

精灵组件，显示 2D 图像。

| 属性 | 类型 | 说明 |
|------|------|------|
| `spriteFrame` | cc.SpriteFrame | 精灵帧资源 |
| `color` | cc.Color | 颜色叠加 |
| `type` | number | 0=简单, 1=切片, 2=平铺, 3=填充 |
| `sizeMode` | number | 0=自定义, 1=原始, 2=裁剪 |
| `fillType` | number | 填充类型（type=3时） |
| `fillCenter` | cc.Vec2 | 填充中心 |
| `fillStart` | number | 填充起点 0-1 |
| `fillRange` | number | 填充范围 0-1 |
| `trim` | boolean | 是否裁剪透明边 |

**配置示例**：
```json
{
  "components": [{
    "uuid": "sprite-uuid",
    "properties": [
      {
        "path": "spriteFrame",
        "type": "cc.SpriteFrame",
        "value": { "uuid": "sprite-frame-asset-uuid" }
      },
      {
        "path": "color",
        "type": "cc.Color",
        "value": { "r": 255, "g": 255, "b": 255, "a": 255 }
      }
    ]
  }]
}
```

---

### cc.Label

文字标签组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `string` | string | 显示文字 |
| `fontSize` | number | 字号 |
| `font` | cc.Font | 字体资源 |
| `fontFamily` | string | 系统字体名 |
| `color` | cc.Color | 文字颜色 |
| `horizontalAlign` | number | 0=左, 1=中, 2=右 |
| `verticalAlign` | number | 0=上, 1=中, 2=下 |
| `overflow` | number | 0=无, 1=裁剪, 2=缩放, 3=调整高度 |
| `lineHeight` | number | 行高 |
| `enableWrapText` | boolean | 自动换行 |
| `enableBold` | boolean | 粗体 |
| `enableItalic` | boolean | 斜体 |
| `enableUnderline` | boolean | 下划线 |
| `cacheMode` | number | 缓存模式 |

**配置示例**：
```json
{
  "components": [{
    "uuid": "label-uuid",
    "properties": [
      { "path": "string", "value": "Hello World" },
      { "path": "fontSize", "value": 36 },
      { "path": "color", "type": "cc.Color", "value": { "r": 0, "g": 0, "b": 0, "a": 255 } },
      { "path": "horizontalAlign", "value": 1 }
    ]
  }]
}
```

---

### cc.Graphics

矢量绘图组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `lineWidth` | number | 线宽 |
| `strokeColor` | cc.Color | 描边颜色 |
| `fillColor` | cc.Color | 填充颜色 |
| `lineCap` | number | 线端点样式 |
| `lineJoin` | number | 线连接样式 |
| `miterLimit` | number | 斜接限制 |

---

### cc.MeshRenderer

3D 网格渲染组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `mesh` | cc.Mesh | 网格资源 |
| `materials` | cc.Material[] | 材质数组 |
| `shadowCastingMode` | number | 阴影投射模式 |
| `receiveShadow` | boolean | 接收阴影 |

---

## UI 组件

### cc.Button

按钮组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `transition` | number | 0=无, 1=颜色, 2=精灵, 3=缩放 |
| `normalColor` | cc.Color | 正常颜色 |
| `pressedColor` | cc.Color | 按下颜色 |
| `hoverColor` | cc.Color | 悬停颜色 |
| `disabledColor` | cc.Color | 禁用颜色 |
| `normalSprite` | cc.SpriteFrame | 正常精灵 |
| `pressedSprite` | cc.SpriteFrame | 按下精灵 |
| `hoverSprite` | cc.SpriteFrame | 悬停精灵 |
| `disabledSprite` | cc.SpriteFrame | 禁用精灵 |
| `duration` | number | 过渡时间 |
| `zoomScale` | number | 缩放比例（transition=3） |
| `interactable` | boolean | 可交互 |

**配置示例**：
```json
{
  "components": [{
    "uuid": "button-uuid",
    "properties": [
      { "path": "transition", "value": 1 },
      { "path": "normalColor", "type": "cc.Color", "value": { "r": 255, "g": 255, "b": 255, "a": 255 } },
      { "path": "pressedColor", "type": "cc.Color", "value": { "r": 200, "g": 200, "b": 200, "a": 255 } }
    ]
  }]
}
```

---

### cc.Toggle

开关/复选框组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `isChecked` | boolean | 选中状态 |
| `checkMark` | cc.Sprite | 选中标记精灵 |
| `checkEvents` | EventHandler[] | 状态改变事件 |

---

### cc.Slider

滑动条组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `handle` | cc.Node | 滑块节点 |
| `direction` | number | 0=水平, 1=垂直 |
| `progress` | number | 当前值 0-1 |
| `slideEvents` | EventHandler[] | 滑动事件 |

---

### cc.ProgressBar

进度条组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `barSprite` | cc.Sprite | 进度精灵 |
| `mode` | number | 0=水平, 1=垂直, 2=填充 |
| `progress` | number | 当前进度 0-1 |
| `totalLength` | number | 总长度 |
| `reverse` | boolean | 反向 |

---

### cc.EditBox

输入框组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `string` | string | 输入内容 |
| `placeholder` | string | 占位文字 |
| `maxLength` | number | 最大长度 |
| `inputMode` | number | 输入模式 |
| `inputFlag` | number | 输入标志（密码等） |
| `returnType` | number | 回车键类型 |
| `fontSize` | number | 字号 |
| `fontColor` | cc.Color | 字体颜色 |
| `placeholderFontSize` | number | 占位字号 |
| `placeholderFontColor` | cc.Color | 占位颜色 |

---

### cc.ScrollView

滚动视图组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `content` | cc.Node | 内容节点 |
| `horizontal` | boolean | 允许水平滚动 |
| `vertical` | boolean | 允许垂直滚动 |
| `inertia` | boolean | 惯性滚动 |
| `brake` | number | 制动系数 0-1 |
| `elastic` | boolean | 弹性效果 |
| `bounceDuration` | number | 弹性时长 |
| `horizontalScrollBar` | cc.Scrollbar | 水平滚动条 |
| `verticalScrollBar` | cc.Scrollbar | 垂直滚动条 |
| `cancelInnerEvents` | boolean | 取消子节点事件 |

---

### cc.RichText

富文本组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `string` | string | 富文本内容（支持标签） |
| `fontSize` | number | 默认字号 |
| `font` | cc.Font | 默认字体 |
| `fontFamily` | string | 系统字体 |
| `maxWidth` | number | 最大宽度 |
| `lineHeight` | number | 行高 |
| `imageAtlas` | cc.SpriteAtlas | 图片图集 |
| `handleTouchEvent` | boolean | 处理触摸事件 |

**富文本标签**：
- `<color=#ff0000>红色</color>`
- `<size=30>大号</size>`
- `<b>粗体</b>`
- `<i>斜体</i>`
- `<u>下划线</u>`
- `<img src='icon'/>`
- `<on click='handler'>可点击</on>`

---

## 布局组件

### cc.Layout

自动布局组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | number | 0=无, 1=水平, 2=垂直, 3=网格 |
| `resizeMode` | number | 0=无, 1=容器, 2=子节点 |
| `paddingLeft` | number | 左内边距 |
| `paddingRight` | number | 右内边距 |
| `paddingTop` | number | 上内边距 |
| `paddingBottom` | number | 下内边距 |
| `spacingX` | number | 水平间距 |
| `spacingY` | number | 垂直间距 |
| `horizontalDirection` | number | 水平排列方向 |
| `verticalDirection` | number | 垂直排列方向 |
| `affectedByScale` | boolean | 受缩放影响 |

**配置示例**：
```json
{
  "components": [{
    "uuid": "layout-uuid",
    "properties": [
      { "path": "type", "value": 1 },
      { "path": "spacingX", "value": 20 },
      { "path": "paddingLeft", "value": 10 },
      { "path": "paddingRight", "value": 10 }
    ]
  }]
}
```

---

### cc.Widget

锚点/对齐组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `isAlignTop` | boolean | 对齐顶部 |
| `isAlignBottom` | boolean | 对齐底部 |
| `isAlignLeft` | boolean | 对齐左边 |
| `isAlignRight` | boolean | 对齐右边 |
| `isAlignHorizontalCenter` | boolean | 水平居中 |
| `isAlignVerticalCenter` | boolean | 垂直居中 |
| `top` | number | 顶部距离 |
| `bottom` | number | 底部距离 |
| `left` | number | 左边距离 |
| `right` | number | 右边距离 |
| `horizontalCenter` | number | 水平偏移 |
| `verticalCenter` | number | 垂直偏移 |
| `alignMode` | number | 对齐模式 |

---

### cc.UITransform

UI 变换组件（所有 UI 元素必有）。

| 属性 | 类型 | 说明 |
|------|------|------|
| `contentSize` | cc.Size | 尺寸 |
| `anchorPoint` | cc.Vec2 | 锚点 (0-1) |
| `priority` | number | 渲染优先级 |

---

## 物理组件

### cc.RigidBody2D

2D 刚体组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | number | 0=静态, 1=运动学, 2=动态 |
| `allowSleep` | boolean | 允许休眠 |
| `gravityScale` | number | 重力缩放 |
| `linearDamping` | number | 线性阻尼 |
| `angularDamping` | number | 角阻尼 |
| `fixedRotation` | boolean | 固定旋转 |
| `bullet` | boolean | 子弹模式（防穿透） |
| `awakeOnLoad` | boolean | 加载时唤醒 |

---

### cc.BoxCollider2D

2D 盒形碰撞器。

| 属性 | 类型 | 说明 |
|------|------|------|
| `offset` | cc.Vec2 | 偏移 |
| `size` | cc.Size | 尺寸 |
| `sensor` | boolean | 是否触发器 |
| `density` | number | 密度 |
| `friction` | number | 摩擦力 |
| `restitution` | number | 弹性 |

---

### cc.CircleCollider2D

2D 圆形碰撞器。

| 属性 | 类型 | 说明 |
|------|------|------|
| `offset` | cc.Vec2 | 偏移 |
| `radius` | number | 半径 |
| `sensor` | boolean | 是否触发器 |

---

### cc.RigidBody

3D 刚体组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | number | 刚体类型 |
| `mass` | number | 质量 |
| `linearDamping` | number | 线性阻尼 |
| `angularDamping` | number | 角阻尼 |
| `useGravity` | boolean | 使用重力 |
| `linearFactor` | cc.Vec3 | 线性因子 |
| `angularFactor` | cc.Vec3 | 角因子 |

---

### cc.BoxCollider

3D 盒形碰撞器。

| 属性 | 类型 | 说明 |
|------|------|------|
| `center` | cc.Vec3 | 中心偏移 |
| `size` | cc.Vec3 | 尺寸 |
| `isTrigger` | boolean | 是否触发器 |
| `material` | cc.PhysicsMaterial | 物理材质 |

---

## 动画组件

### cc.Animation

动画组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `defaultClip` | cc.AnimationClip | 默认动画片段 |
| `clips` | cc.AnimationClip[] | 动画片段列表 |
| `playOnLoad` | boolean | 加载时播放 |

---

### cc.Skeleton

Spine 骨骼动画组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `skeletonData` | sp.SkeletonData | 骨骼数据 |
| `defaultSkin` | string | 默认皮肤 |
| `defaultAnimation` | string | 默认动画 |
| `loop` | boolean | 循环播放 |
| `premultipliedAlpha` | boolean | 预乘 Alpha |
| `timeScale` | number | 时间缩放 |

---

## 音频组件

### cc.AudioSource

音频源组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `clip` | cc.AudioClip | 音频片段 |
| `volume` | number | 音量 0-1 |
| `loop` | boolean | 循环播放 |
| `playOnAwake` | boolean | 唤醒时播放 |

---

## 其他组件

### cc.Camera

摄像机组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `projection` | number | 0=正交, 1=透视 |
| `fov` | number | 视野角度 |
| `orthoHeight` | number | 正交高度 |
| `near` | number | 近裁剪面 |
| `far` | number | 远裁剪面 |
| `clearFlags` | number | 清除标志 |
| `clearColor` | cc.Color | 清除颜色 |
| `clearDepth` | number | 清除深度 |
| `visibility` | number | 可见层掩码 |
| `priority` | number | 渲染优先级 |

---

### cc.DirectionalLight

方向光组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `color` | cc.Color | 光照颜色 |
| `illuminance` | number | 照度 |
| `staticSettings` | object | 静态光照设置 |
| `shadowEnabled` | boolean | 启用阴影 |
| `shadowPcf` | number | PCF 等级 |
| `shadowBias` | number | 阴影偏移 |
| `shadowNormalBias` | number | 法线偏移 |
| `shadowSaturation` | number | 阴影饱和度 |

---

### cc.ParticleSystem

粒子系统组件。

| 属性 | 类型 | 说明 |
|------|------|------|
| `duration` | number | 持续时间 |
| `capacity` | number | 最大粒子数 |
| `loop` | boolean | 循环 |
| `playOnAwake` | boolean | 自动播放 |
| `startDelay` | number | 开始延迟 |
| `startLifetime` | number | 粒子生命周期 |
| `startSpeed` | number | 初始速度 |
| `startSize` | number | 初始大小 |
| `startColor` | cc.Color | 初始颜色 |
| `gravityModifier` | number | 重力修改器 |
| `rateOverTime` | number | 发射速率 |

---

## 属性路径格式

### 基础类型

```json
{ "path": "propertyName", "value": 123 }
{ "path": "propertyName", "value": "string" }
{ "path": "propertyName", "value": true }
```

### 复合类型

```json
{ "path": "color", "type": "cc.Color", "value": { "r": 255, "g": 0, "b": 0, "a": 255 } }
{ "path": "position", "type": "cc.Vec3", "value": { "x": 0, "y": 0, "z": 0 } }
{ "path": "size", "type": "cc.Size", "value": { "width": 100, "height": 100 } }
```

### 资源引用

```json
{ "path": "spriteFrame", "type": "cc.SpriteFrame", "value": { "uuid": "asset-uuid" } }
{ "path": "font", "type": "cc.Font", "value": { "uuid": "font-asset-uuid" } }
{ "path": "clip", "type": "cc.AudioClip", "value": { "uuid": "audio-uuid" } }
```

### 嵌套属性

```json
{ "path": "shapeModule.shapeType", "value": 1 }
{ "path": "colorOverLifetimeModule.color", "type": "cc.GradientRange", "value": {...} }
```
