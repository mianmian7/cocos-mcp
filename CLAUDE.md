# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cocos MCP is a Cocos Creator extension that implements a Model Context Protocol (MCP) server with dual transport support. The extension runs directly within Cocos Creator and provides AI assistants with comprehensive tools to interact with game projects.

**Last Updated**: 2025-08-25
**Version**: 1.0.2
**Author**: Roma Rogov, mianmian7

## Project Architecture

```mermaid
graph TB
    subgraph "Cocos MCP Extension"
        A[Extension Entry<br/>source/main.ts] --> B[MCP Server Core<br/>source/mcp/]
        A --> C[UI Panels<br/>source/panels/]
        
        subgraph "MCP Server Core"
            B1[Server Manager<br/>server-manager.ts]
            B2[Configuration<br/>config.ts, config-storage.ts]
            B3[Transports<br/>sse-transport.ts]
            B4[Services<br/>image-generation-service.ts]
            
            B1 --> B5[Tools System<br/>source/mcp/tools/]
            B1 --> B6[Asset Interpreters<br/>source/mcp/tools/asset-interpreters/]
        end
        
        subgraph "Tools System"
            B5 --> B5a[Discovery & Inspection<br/>query_*, get_available_*]
            B5 --> B5b[Creation & Modification<br/>create_*, modify_*]
            B5 --> B5c[Asset & Project Management<br/>operate_*, node_linked_*]
            B5 --> B5d[Advanced Operations<br/>execute_scene_code, operate_scripts]
        end
        
        subgraph "Asset Interpreters"
            B6 --> B6a[Base Interpreter<br/>base-interpreter.ts]
            B6 --> B6b[Specialized Interpreters<br/>animation, audio, image, material, etc.]
            B6 --> B6c[Manager<br/>asset-interpreter-manager.ts]
        end
        
        subgraph "UI Panels"
            C1[Default Panel<br/>default/index.ts]
            C2[Image Generator<br/>image-generator/index.ts]
            C3[AI Configuration<br/>ai-config/index.ts]
        end
        
        B --> B5
        B --> B6
        A --> C1
        A --> C2
        A --> C3
    end
    
    subgraph "External Dependencies"
        D1[@modelcontextprotocol/sdk]
        D2[Express.js]
        D3[Zod Validation]
        D4[Vue3]
        D5[Cocos Creator Types]
    end
    
    B1 --> D1
    B1 --> D2
    B1 --> D3
    C --> D4
    A --> D5
    
    style A fill:#e1f5fe
    style B1 fill:#f3e5f5
    style B5 fill:#e8f5e8
    style B6 fill:#fff3e0
    style C fill:#fce4ec
```

## Module Index

| Module | Path | Type | Status | Documentation |
|--------|------|------|--------|---------------|
| **Extension Entry** | `source/main.ts` | Entry Point | ✅ Active | [Main Module](#extension-entry) |
| **MCP Server Core** | `source/mcp/` | Core Module | ✅ Active | [Server Core](#mcp-server-core) |
| **Tools System** | `source/mcp/tools/` | Feature Module | ✅ Active | [Tools System](#tools-system) |
| **Asset Interpreters** | `source/mcp/tools/asset-interpreters/` | Feature Module | ✅ Active | [Asset Interpreters](#asset-interpreters) |
| **UI Panels** | `source/panels/` | UI Module | ✅ Active | [UI Panels](#ui-panels) |

### Module Navigation

**🧭 Extension Entry** → **🔧 MCP Server Core** → **🛠️ Tools System** → **📦 Asset Interpreters** → **🎨 UI Panels**

## Build and Development Commands

```bash
# Install dependencies
npm install

# Build the extension (compiles TypeScript to dist/)
npm run build
```

No lint or test commands are configured in this project.

## Architecture Overview

This is a Cocos Creator extension that implements a Model Context Protocol (MCP) server with dual transport support. The extension runs directly within Cocos Creator and provides AI assistants with tools to interact with game projects.

### <a id="extension-entry">Extension Entry Point</a> `source/main.ts`

**Purpose**: Main entry point for the Cocos MCP extension
**Key Features**:
- Lazy loading of MCP Server Manager
- Extension lifecycle management (load/unload)
- UI panel management
- AI image generation configuration
- Server control methods

**Dependencies**: Cocos Creator Editor API, MCP Server Manager

**Navigation**: [🔧 MCP Server Core](#mcp-server-core) | [🎨 UI Panels](#ui-panels)

---

### <a id="mcp-server-core">MCP Server Core</a> `source/mcp/`

**Purpose**: Core MCP server implementation with dual transport support
**Key Files**:
- `server-manager.ts` - Main server orchestrator
- `config.ts` / `config-storage.ts` - Configuration management
- `sse-transport.ts` - SSE transport implementation
- `services/image-generation-service.ts` - AI image generation

**Features**:
- Dual transport support (Streamable HTTP + SSE)
- Session-based transport management
- CORS support for web clients
- Tool registration and management
- Image generation service integration

**Navigation**: [🛠️ Tools System](#tools-system) | [📦 Asset Interpreters](#asset-interpreters)

---

### <a id="tools-system">Tools System</a> `source/mcp/tools/`

**Purpose**: 16 specialized tools for game project interaction
**Tool Categories**:

#### Discovery & Inspection
- `query-nodes.ts` - Node discovery and querying
- `query-components.ts` - Component inspection
- `get-available-asset-types.ts` - Asset type enumeration
- `get-available-component-types.ts` - Component type enumeration
- `get-assets-by-type.ts` - Asset filtering and retrieval

#### Creation & Modification
- `create-nodes.ts` - Node creation and placement
- `modify-nodes.ts` - Node property modification
- `modify-components.ts` - Component property modification
- `generate-image-asset.ts` - AI-powered image generation

#### Asset & Project Management
- `operate-assets.ts` - General asset operations
- `operate-current-scene.ts` - Scene management
- `operate-prefab-assets.ts` - Prefab operations
- `node-linked-prefabs-operations.ts` - Prefab linking operations
- `operate-project-settings.ts` - Project configuration

#### Advanced Operations
- `execute-scene-code.ts` - Scene script execution
- `operate-scripts-and-text.ts` - Script and text file operations

**Navigation**: [📦 Asset Interpreters](#asset-interpreters) | [🔧 MCP Server Core](#mcp-server-core)

---

### <a id="asset-interpreters">Asset Interpreters</a> `source/mcp/tools/asset-interpreters/`

**Purpose**: Specialized handlers for different asset types
**Key Files**:
- `base-interpreter.ts` - Base interpreter pattern
- `asset-interpreter-manager.ts` - Interpreter coordination
- Specialized interpreters for each asset type

**Supported Asset Types**:
- Animation clips, Audio clips, Images
- Materials, Prefabs, Particle effects
- Physics materials, Render textures
- Sprite frames, Textures, Video clips
- Scripts (JavaScript/TypeScript), JSON files

**Features**:
- Asset-specific interpretation and manipulation
- Type-safe asset handling
- Extensible interpreter pattern

**Navigation**: [🛠️ Tools System](#tools-system) | [🔧 MCP Server Core](#mcp-server-core)

---

### <a id="ui-panels">UI Panels</a> `source/panels/`

**Purpose**: Vue3-based user interface panels
**Panels**:
- `default/` - MCP server control and management
- `image-generator/` - AI image generation interface
- `ai-config/` - AI provider configuration

**Features**:
- Server start/stop control
- Configuration management
- Image generation interface
- AI provider testing
- Real-time server status

**Navigation**: [🔧 MCP Server Core](#mcp-server-core) | [🧭 Extension Entry](#extension-entry)

### Core Components

**MCP Server Architecture** (`source/mcp/`):
- `server-manager.ts` - Main MCP server manager using Express.js with dual transport support
- `sse-transport.ts` - SSE transport implementation for broader client compatibility
- `config.ts` / `config-storage.ts` - Server configuration and persistence
- `services/image-generation-service.ts` - AI image generation integration

**Tools System** (`source/mcp/tools/`):
16 specialized tools organized into categories:
- **Discovery & Inspection**: query_nodes, query_components, get_available_asset_types, get_available_component_types, get_assets_by_type
- **Creation & Modification**: create_nodes, modify_nodes, modify_components, generate_image_asset
- **Asset & Project Management**: operate_assets, operate_current_scene, operate_prefab_assets, node_linked_prefabs_operations, operate_project_settings
- **Advanced Operations**: execute_scene_code, operate_scripts_and_text

**Asset Interpreters** (`source/mcp/tools/asset-interpreters/`):
Specialized handlers for different asset types (animation, audio, image, material, prefab, etc.) that provide asset-specific interpretation and manipulation capabilities.

**Extension UI** (`source/panels/`):
Vue3-based panels for MCP server control, AI image generation configuration, and server management.

### Key Technical Details

- **Dual Transport Support**: Both Streamable HTTP and SSE transports for maximum compatibility
- **Primary Endpoint**: `http://localhost:3000/mcp` - Streamable HTTP transport (newer protocol)
- **Compatibility Endpoint**: `http://localhost:3000/mcp-sse` - SSE transport for broader client support
- **Protocol**: JSON-RPC 2.0 with Zod schema validation
- **Type Safety**: Full TypeScript with Cocos Creator types
- **State Management**: Session-based transport management with CORS support
- **AI Integration**: Extensible image generation with multiple providers (AUTOMATIC1111, Stable Diffusion, OpenAI DALL-E)

### Transport Endpoints

#### Streamable HTTP Transport (`/mcp`)
- **Purpose**: Primary endpoint using the latest MCP Streamable HTTP protocol
- **Method**: POST requests for bidirectional communication
- **Compatibility**: Works with MCP clients that support the 2025-03-26 protocol version
- **Use Case**: Recommended for newer MCP clients and tools

#### SSE Transport (`/mcp-sse`)
- **Purpose**: Compatibility endpoint using Server-Sent Events protocol
- **Methods**: 
  - GET `/mcp-sse` - Establish SSE stream for server-to-client messages
  - POST `/mcp-sse-messages?sessionId=<id>` - Send client-to-server messages
- **Compatibility**: Works with older MCP clients and third-party tools like Roo Code
- **Use Case**: Recommended for Roo Code and other clients that require standard SSE protocol

### Client Connection Guide

**For Roo Code and similar clients:**
```
Endpoint: http://localhost:3000/mcp-sse
Transport: Server-Sent Events (SSE)
```

**For newer MCP clients:**
```
Endpoint: http://localhost:3000/mcp
Transport: Streamable HTTP
```

### Development Patterns

**Adding New Tools**:
1. Create tool file in `source/mcp/tools/`
2. Implement with `server.registerTool()` using Zod schemas
3. Export registration function
4. Import and register in `server-manager.ts`

**Asset Type Handling**:
- Asset interpreters follow base interpreter pattern
- Each interpreter handles specific asset type operations
- Manager coordinates interpreter selection and execution

### Configuration

The extension uses JSON-based configuration stored via `ConfigStorage` class for:
- MCP server settings (port, host, CORS)
- AI image generation providers and models
- User preferences and API credentials

### Dependencies

Core runtime dependencies: `@modelcontextprotocol/sdk`, `express`, `zod`, `vue`, `sharp`, `@huggingface/inference`
Development dependencies: `@cocos/creator-types`, TypeScript types