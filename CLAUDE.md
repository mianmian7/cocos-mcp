# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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