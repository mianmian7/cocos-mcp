---
name: cocos-creator-editor
description: |
  Control Cocos Creator editor through MCP gateway tools.
  Use for: scene editing, node manipulation, asset management, component operations.
  Triggers: cocos, game development, scene, node, prefab, sprite, component, 3D, 2D game
version: 1.0.0
license: MIT
compatibility:
  platforms:
    - windows
    - macos
  tools:
    - get_editor_context
    - search_nodes
    - editor_request
    - apply_gated_action
allowed-tools:
  - Bash
  - Read
  - Write
  - get_editor_context
  - search_nodes
  - editor_request
  - apply_gated_action
---

# Cocos Creator Editor Control

Control Cocos Creator editor via 4 MCP gateway tools.

## Prerequisites

1. Cocos Creator running with project open
2. MCP server started: `Panel → cocos-mcp → MCP Server Settings → Start`

## Tools

| Tool | Purpose |
|------|---------|
| `get_editor_context` | Get editor state snapshot (supports large scenes with summaryOnly) |
| `search_nodes` | Search nodes by name/component/path pattern |
| `editor_request` | Call editor API (allowlist controlled) |
| `apply_gated_action` | Execute risky operations (requires approval) |

## Workflow

```
1. get_editor_context  → Understand current state
2. search_nodes        → Find specific nodes (large scenes)
3. editor_request      → Perform read/write operations
4. apply_gated_action  → Dangerous operations (delete, execute code)
5. get_editor_context  → Verify results
```

## Large Scene Handling (3000+ nodes)

```json
// 1. Get summary (uuid + name + childCount only)
get_editor_context({
  summaryOnly: true,
  maxNodes: 3000,
  maxDepth: 5
})

// 2. Search for specific nodes
search_nodes({
  namePattern: "Enemy*",
  componentType: "Sprite",
  limit: 50
})

// 3. Query specific branch
get_editor_context({
  parentUuid: "some-uuid",
  maxDepth: 2
})

// 4. Get single node details
editor_request({
  channel: "scene",
  command: "query-node",
  args: ["node-uuid"]
})
```

## search_nodes Examples

```json
// Find all nodes named "Enemy*"
search_nodes({namePattern: "Enemy*"})

// Find all nodes with Sprite component
search_nodes({componentType: "Sprite"})

// Find nodes under Canvas path
search_nodes({pathPattern: "Canvas/*"})

// Combined search with pagination
search_nodes({
  namePattern: "*Button*",
  componentType: "Button",
  limit: 20,
  offset: 0
})
```

## editor_request Commands

### Scene Channel

| Command | Mode | Args | Description |
|---------|------|------|-------------|
| `query-node` | read | `[uuid]` | Get single node details |
| `query-scene-info` | read | `[]` | Get current scene info |
| `query-classes` | read | `[]` | Get available component types |
| `create-node` | write | `[{name?, parent?, type?}]` | Create node |
| `remove-node` | write | `[{uuid}]` | Remove node |
| `set-property` | write | `[{uuid, path, dump}]` | Set property |
| `create-component` | write | `[{uuid, component}]` | Add component |
| `save-scene` | write | `[]` | Save scene |

> **Note**: Use `get_editor_context` for hierarchy overview (has size limits). Use `query-node` for single node details.

### Asset-DB Channel

| Command | Mode | Args | Description |
|---------|------|------|-------------|
| `query-asset-info` | read | `[urlOrUuid]` | Query asset |
| `query-assets` | read | `[{pattern?, type?}]` | Batch query |
| `create-asset` | write | `[url, content?]` | Create asset |

## Examples

### Create a Cube at Position

```json
// Step 1: Create node
editor_request({
  channel: "scene",
  command: "create-node",
  args: [{name: "MyCube", type: "3D/Cube"}]
})
// Returns: {result: {uuid: "abc123"}}

// Step 2: Set position
editor_request({
  channel: "scene", 
  command: "set-property",
  args: [{
    uuid: "abc123",
    path: "position",
    dump: {type: "cc.Vec3", value: {x: 0, y: 2, z: 0}}
  }]
})
```

### Add Component

```json
editor_request({
  channel: "scene",
  command: "create-component", 
  args: [{uuid: "node-uuid", component: "cc.RigidBody"}]
})
```

### Delete Nodes (Requires Approval)

```json
// Step 1: Request approval
apply_gated_action({
  action: "delete_nodes",
  params: {uuids: ["uuid1", "uuid2"]}
})
// Returns: {approvalToken: "gated_xxx", requiresApproval: true}

// Step 2: Execute with token
apply_gated_action({
  action: "delete_nodes",
  params: {uuids: ["uuid1", "uuid2"]},
  approvalToken: "gated_xxx"
})
```

### List Available Commands

```json
editor_request({listCommands: true})
```

## Property Paths

| Path | Target |
|------|--------|
| `position` | Vec3 position |
| `scale` | Vec3 scale |
| `euler` | Vec3 rotation (degrees) |
| `active` | Boolean visibility |
| `__comps__.0.enabled` | First component enabled |
| `__comps__.0.color` | First component color |

## Dump Types

| Type | Value Format |
|------|--------------|
| `cc.Vec3` | `{x, y, z}` |
| `cc.Vec2` | `{x, y}` |
| `cc.Color` | `{r, g, b, a}` (0-255) |
| `cc.Size` | `{width, height}` |
| `Boolean` | `true/false` |
| `String` | `"text"` |
| `Number` | `123` |

## apply_gated_action Types

| Action | Risk | Params |
|--------|------|--------|
| `delete_nodes` | high | `{uuid}` or `{uuids: []}` |
| `delete_assets` | critical | `{url}` or `{urls: []}` |
| `save_scene` | medium | - |
| `execute_code` | critical | `{code}` |
| `clear_scene` | critical | - |

## Tips

1. Always `get_editor_context` before operations
2. Use `listCommands: true` to see available commands
3. High-risk actions need two-step approval
4. Check `recentLogs` in context for errors
