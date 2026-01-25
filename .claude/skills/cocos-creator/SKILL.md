---
name: cocos-creator-editor
description: |
  Control Cocos Creator editor through HTTP API and CLI.
  Use for: scene editing, node manipulation, asset management, component operations.
  Triggers: cocos, game development, scene, node, prefab, sprite, component, 3D, 2D game
version: 2.0.0
license: MIT
compatibility:
  platforms:
    - windows
    - macos
---

# Cocos Creator Editor Control

Control Cocos Creator editor via HTTP endpoints and CLI.

## Prerequisites

1. Cocos Creator running with project open
2. HTTP server started: `Panel → cocos-mcp → MCP Server Settings → Start`

## Quick Start

```bash
# Get editor context
python cocos-cli.py context

# Search for nodes
python cocos-cli.py search-nodes --name "Player*"

# Create a node
python cocos-cli.py create-nodes '{"nodes": [{"type": "Empty", "name": "MyNode"}]}'

# Health check
python cocos-cli.py health
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `context` | Get editor context snapshot |
| `search-nodes` | Search nodes by name/component/path |
| `query-nodes` | Query node hierarchy |
| `create-nodes` | Create nodes |
| `modify-nodes` | Modify nodes |
| `query-components` | Query components |
| `modify-components` | Modify components |
| `current-scene` | Operate current scene |
| `assets` | Operate assets |
| `prefab-assets` | Operate prefab assets |
| `discovery` | Discovery endpoints |
| `project-settings` | Operate project settings |
| `scripts-text` | Operate scripts and text |
| `execute-scene` | Execute scene code |
| `editor-request` | Generic editor request |
| `apply-gated-action` | Execute risky operations |
| `tool` | Generic tool call |
| `health` | Health check |
| `tools` | List available tools |

## HTTP Endpoints

Base URL: `http://127.0.0.1:<port>/cocos`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cocos/health` | GET | Health check |
| `/cocos/tools` | GET | List tools |
| `/cocos/context` | GET/POST | Editor context |
| `/cocos/search-nodes` | POST | Search nodes |
| `/cocos/query-nodes` | POST | Query hierarchy |
| `/cocos/create-nodes` | POST | Create nodes |
| `/cocos/modify-nodes` | POST | Modify nodes |
| `/cocos/query-components` | POST | Query components |
| `/cocos/modify-components` | POST | Modify components |
| `/cocos/current-scene` | POST | Scene operations |
| `/cocos/assets` | POST | Asset operations |
| `/cocos/prefab-assets` | POST | Prefab operations |
| `/cocos/discovery/components` | GET | Available components |
| `/cocos/discovery/assets` | GET | Available asset types |
| `/cocos/project-settings` | POST | Project settings |
| `/cocos/scripts-text` | POST | Script operations |
| `/cocos/execute-scene` | POST | Execute scene code |
| `/cocos/editor-request` | POST | Generic editor API |
| `/cocos/apply-gated-action` | POST | Risky operations |
| `/cocos/tool/:name` | POST | Generic tool call |

## Workflow

```
1. context           → Understand current state
2. search-nodes      → Find specific nodes (large scenes)
3. create-nodes      → Create new nodes
4. modify-nodes      → Modify existing nodes
5. context           → Verify results
```

## Examples

### Get Editor Context

```bash
# Basic context
python cocos-cli.py context

# Summary only (for large scenes)
python cocos-cli.py context --summary-only --max-nodes 3000

# Query specific branch
python cocos-cli.py context --parent-uuid "abc123"
```

### Search Nodes

```bash
# By name pattern
python cocos-cli.py search-nodes --name "Enemy*"

# By component type
python cocos-cli.py search-nodes --component "Sprite"

# Combined search
python cocos-cli.py search-nodes --name "*Button*" --component "Button" --limit 20
```

### Create Nodes

```bash
# Create empty node
python cocos-cli.py create-nodes '{"nodes": [{"type": "Empty", "name": "MyNode"}]}'

# Create 3D cube
python cocos-cli.py create-nodes '{"nodes": [{"type": "3D/Cube", "name": "MyCube", "position": {"x": 0, "y": 2, "z": 0}}]}'

# Create UI button under Canvas
python cocos-cli.py create-nodes '{"nodes": [{"type": "UI/Button (with Label)", "name": "MyButton"}]}'
```

### Modify Nodes

```bash
# Set position
python cocos-cli.py modify-nodes '{"modifications": [{"nodeUuid": "abc123", "properties": [{"path": "position", "value": {"x": 1, "y": 2, "z": 3}}]}]}'

# Rename node
python cocos-cli.py modify-nodes '{"modifications": [{"nodeUuid": "abc123", "properties": [{"path": "name", "value": "NewName"}]}]}'
```

### Execute Scene Code

```bash
python cocos-cli.py execute-scene '{"code": "console.log(\"Hello from scene!\")"}'
```

### Apply Gated Action (Two-Step)

```bash
# Step 1: Request approval
python cocos-cli.py apply-gated-action '{"action": "delete_nodes", "params": {"uuids": ["uuid1"]}}'
# Returns: {"approvalToken": "gated_xxx", "requiresApproval": true}

# Step 2: Execute with token
python cocos-cli.py apply-gated-action '{"action": "delete_nodes", "params": {"uuids": ["uuid1"]}, "approvalToken": "gated_xxx"}'
```

### Generic Editor Request

```bash
# Query single node
python cocos-cli.py editor-request '{"channel": "scene", "command": "query-node", "args": ["node-uuid"]}'

# Save scene
python cocos-cli.py editor-request '{"channel": "scene", "command": "save-scene", "args": []}'

# List available commands
python cocos-cli.py editor-request '{"listCommands": true}'
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

## Value Types

| Type | Format |
|------|--------|
| `cc.Vec3` | `{x, y, z}` |
| `cc.Vec2` | `{x, y}` |
| `cc.Color` | `{r, g, b, a}` (0-255) |
| `cc.Size` | `{width, height}` |
| `Boolean` | `true/false` |
| `String` | `"text"` |
| `Number` | `123` |

## Gated Actions

| Action | Risk | Params |
|--------|------|--------|
| `delete_nodes` | high | `{uuid}` or `{uuids: []}` |
| `delete_assets` | critical | `{url}` or `{urls: []}` |
| `save_scene` | medium | - |
| `execute_code` | critical | `{code}` |
| `clear_scene` | critical | - |

## Tips

1. Always check context before operations
2. Use `--pretty` flag for readable JSON output
3. High-risk actions need two-step approval
4. Port auto-detected from `.cocos-mcp-config.json`
