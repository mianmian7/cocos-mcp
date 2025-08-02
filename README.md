# Cocos Creator MCP Server

A Cocos Creator extension that implements a Model Context Protocol (MCP) server with Streamable HTTP transport. This extension exposes Cocos Creator's functionality through a standardized interface that can be used by AI assistants and other MCP clients.

## Features

### MCP Server Capabilities
- **Resources**: Read-only access to Cocos Creator's asset database
- **Tools**: Actions for creating, modifying, and managing scenes, nodes, components, and assets
- **AI Image Generation**: Integrate with multiple AI providers for automated asset creation

### Core Tools
- Scene management (create, modify, query nodes and components)
- Asset operations (create, import, modify, query assets)
- Project settings configuration
- Prefab operations and management

### AI Image Generation
- **Multiple Provider Support**: Stable Diffusion, AUTOMATIC1111, OpenAI DALL-E, custom providers
- **Dynamic Model Selection**: Automatically populated from configured providers
- **Template Enhancement**: Use SVG content as init images for AI generation
- **Flexible Input**: Text prompts, emoji, or SVG content
- **Asset Integration**: Generated images automatically imported as Cocos Creator assets
- **Provider Testing**: Built-in connectivity and functionality testing

### UI Panel
- Start/Stop MCP server controls with real-time status indicator
- Configurable port settings (default: 3000)
- Auto-refresh of server status every 5 seconds

## Architecture

The extension consists of several key components:

1. **Extension Panel** (`source/panels/default/`): Vue3-based UI for controlling the MCP server
2. **MCP Server Manager** (`source/mcp/server-manager.ts`): Manages the HTTP server and MCP transport
3. **Resources** (`source/mcp/resources/`): Expose Cocos Creator data through database access
4. **Tools** (`source/mcp/tools/`): Provide actions for modifying the project

## Development Environment

- Node.js
- TypeScript
- Vue 3.x
- Express.js for HTTP server
- MCP TypeScript SDK

## Installation

```bash
# Install dependencies
npm install

# Build the extension
npm run build
```

## Usage

1. Install the extension in Cocos Creator
2. Enable the extension in the Extension Manager
3. Open the MCP panel: `Panel -> cocos-mcp -> MCP Server Control Panel`
4. Configure the server port (default: 3000)
5. Start the MCP server
6. Connect MCP clients to `http://localhost:{port}/mcp`

### AI Image Generation Setup

1. **Configure Providers**: Use the extension's AI Image Generation config panel
2. **Add Models**: Configure available models for each provider through the UI
3. **Test Connectivity**: Verify provider setup with the built-in test function
4. **Generate Assets**: Use the `generate_image_asset` MCP tool

#### Quick Start with Local Stable Diffusion

1. Open the AI Image Generation config panel in Cocos Creator
2. Add a new Stable Diffusion provider pointing to `http://localhost:7860`
3. Configure your models through the UI
4. Test the connection

Then generate assets via MCP:
```javascript
{
  "prompt": "A fantasy sword with blue glowing runes",
  "destination": "db://assets/weapons/magic-sword.png",
  "assetType": "sprite-frame",
  "model": "your-configured-model",
  "provider": "your-provider-id"
}
```

See the [AI Image Generation Guide](docs/ai-image-generation-guide.md) for complete documentation.

## Available Resources

- `db://{path}` - Universal access to Cocos Creator database with asset information

## Available Tools

### **Inspection & Hierarchy**
- `inspect_node_hierarchy` - Returns node hierarchy with names, UUIDs, components, and children
- `inspect_components_properties` - Returns properties of components: names, paths, types, values, enums

### **Asset Management**
- `get_available_asset_types` - Get all available asset types in the project
- `create_asset_from_template` - Creates asset by copying a template to destination folder
- `generate_image_asset` - Generates image from SVG or emoji and creates an asset of selected type
- `operate_asset` - Copies, moves, or deletes assets by path

### **Scene & Prefab Operations**
- `open_scene` - Opens a scene by asset UUID or path
- `save_current_scene_or_prefab` - Saves the currently opened scene or prefab
- `open_prefab` - Open a prefab for editing by asset UUID or URL
- `close_prefab` - Closes the current prefab, with optional save

### **Node Management**
- `create_nodes` - Creates nodes using type, name, components, and transform. Supports prefabs
- `set_nodes_properties` - Updates properties of nodes: name, transform, mobility, visibility, layer
- `operate_nodes` - Removes, duplicates, or changes parent of multiple nodes

### **Component Management**
- `get_available_component_types` - Returns all available component types in the project
- `add_components_to_nodes` - Adds components to multiple nodes
- `remove_components` - Removes components by their UUIDs
- `set_components_properties` - Sets properties on components using path, type, and value

### **Prefab Operations**
- `create_prefab_from_node` - Creates prefab asset from an existing node
- `node_linked_prefabs_operations` - Performs prefab-related actions: edit, unwrap, locate, reset, update

### **Material & Project Settings**
- `set_materials_properties` - Updates properties of materials: texture, color, effect, etc. (Note: Internal materials are protected)
- `operate_project_settings` - Optionally set project settings and get current values

### **File Operations**
- `operate_scripts_and_text` - Tool for agents who can't work with project files directly. Performs operations like reading file content (with optional line range), writing content to files (with optional line insertion), searching for patterns, and getting file information. Supports filtering and common text file operations.

## Technical Implementation

- **Transport**: Streamable HTTP transport with Express.js server
- **Protocol**: JSON-RPC 2.0 compliance with proper error handling
- **Session Management**: Stateful connections with CORS support
- **Type Safety**: Full TypeScript implementation with Zod schemas for input validation
- **Modular Architecture**: Each resource, tool, and completion implemented in separate files

## Development

### Adding New Resources
1. Create new file in `source/mcp/resources/`
2. Implement using `server.registerResource()` 
3. Export registration function
4. Add import and call in `server-manager.ts`

### Adding New Tools
1. Create new file in `source/mcp/tools/`
2. Implement using `server.registerTool()` with Zod schema
3. Export registration function
4. Add import and call in `server-manager.ts`

### Adding New Completions
Note: Completions are not currently implemented in this version, but can be added by:
1. Create new file in `source/mcp/completions/`
2. Implement completion logic
3. Export registration function
4. Add import and call in `server-manager.ts`

## Dependencies

- `@modelcontextprotocol/sdk` - MCP TypeScript SDK
- `express` - HTTP server framework
- `zod` - Schema validation
- `vue` - UI framework for the panel

## License

This project is licensed under the MIT License.