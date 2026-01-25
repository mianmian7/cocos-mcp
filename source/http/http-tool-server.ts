/**
 * HTTP Tool Server - Express HTTP server replacing MCP transport
 *
 * Provides REST endpoints under /cocos/* prefix for all Cocos Creator tools.
 * Reuses existing tool implementations through the ToolRegistry adapter.
 */

import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { ToolRegistry, getToolRegistry } from './tool-registry.js';
import { ConfigStorage } from '../mcp/config-storage.js';
import { McpServerConfig, DEFAULT_SERVER_CONFIG } from '../mcp/config.js';
import { ImageGenerationService } from '../mcp/services/image-generation-service.js';

// Import tool registration functions (excluding generateImageAsset)
import { registerCreateNodesTool } from '../mcp/tools/create-nodes.js';
import { registerModifyNodesTool } from '../mcp/tools/modify-nodes.js';
import { registerQueryNodesTool } from '../mcp/tools/query-nodes.js';
import { registerQueryComponentsTool } from '../mcp/tools/query-components.js';
import { registerModifyComponentsTool } from '../mcp/tools/modify-components.js';
import { registerNodeLinkedPrefabsOperationsTool } from '../mcp/tools/node-linked-prefabs-operations.js';
import { registerGetAvailableComponentTypesTool } from '../mcp/tools/get-available-component-types.js';
import { registerGetAvailableAssetTypesTool } from '../mcp/tools/get-available-asset-types.js';
import { registerOperateAssetsTool } from '../mcp/tools/operate-assets.js';
import { registerGetAssetsByTypeTool } from '../mcp/tools/get-assets-by-type.js';
import { registerOperateCurrentSceneTool } from '../mcp/tools/operate-current-scene.js';
import { registerOperateProjectSettingsTool } from '../mcp/tools/operate-project-settings.js';
import { registerOperatePrefabAssetsTool } from '../mcp/tools/operate-prefab-assets.js';
import { registerOperateScriptsAndTextTool } from '../mcp/tools/operate-scripts-and-text.js';
import { registerExecuteSceneCodeTool } from '../mcp/tools/execute-scene-code.js';
import { registerGetEditorContextTool } from '../mcp/tools/get-editor-context.js';
import { registerEditorRequestTool } from '../mcp/tools/editor-request.js';
import { registerApplyGatedActionTool } from '../mcp/tools/apply-gated-action.js';
import { registerSearchNodesTool } from '../mcp/tools/search-nodes.js';

/**
 * Route mapping from HTTP endpoints to tool names
 */
const ROUTE_TO_TOOL: Record<string, string> = {
    '/cocos/context': 'get_editor_context',
    '/cocos/search-nodes': 'search_nodes',
    '/cocos/query-nodes': 'query_nodes',
    '/cocos/create-nodes': 'create_nodes',
    '/cocos/modify-nodes': 'modify_nodes',
    '/cocos/query-components': 'query_components',
    '/cocos/modify-components': 'modify_components',
    '/cocos/current-scene': 'operate_current_scene',
    '/cocos/assets': 'operate_assets',
    '/cocos/prefab-assets': 'operate_prefab_assets',
    '/cocos/node-prefab': 'node_linked_prefabs_operations',
    '/cocos/discovery/components': 'get_available_component_types',
    '/cocos/discovery/assets': 'get_available_asset_types',
    '/cocos/discovery/assets-by-type': 'get_assets_by_type',
    '/cocos/project-settings': 'operate_project_settings',
    '/cocos/scripts-text': 'operate_scripts_and_text',
    '/cocos/execute-scene': 'execute_scene_code',
    '/cocos/editor-request': 'editor_request',
    '/cocos/apply-gated-action': 'apply_gated_action'
};

export class HttpToolServer {
    private static instance: HttpToolServer | null = null;
    private httpServer: HttpServer | null = null;
    private expressApp: express.Application | null = null;
    private config: McpServerConfig = { ...DEFAULT_SERVER_CONFIG };
    private isRunning: boolean = false;
    private configStorage: ConfigStorage;
    private imageGenerationService: ImageGenerationService;
    private toolRegistry: ToolRegistry;

    constructor() {
        this.configStorage = new ConfigStorage();
        this.config = this.configStorage.loadConfig();
        this.imageGenerationService = new ImageGenerationService(this.config.imageGeneration);
        this.toolRegistry = getToolRegistry();
        HttpToolServer.instance = this;
    }

    public static getInstance(): HttpToolServer | null {
        return HttpToolServer.instance;
    }

    /**
     * Register all tools with the registry
     */
    private registerTools(): void {
        const registry = this.toolRegistry as any; // Cast to use as mock McpServer

        // Gateway tools
        if (this.config.tools.getEditorContext) {
            registerGetEditorContextTool(registry);
        }
        if (this.config.tools.editorRequest) {
            registerEditorRequestTool(registry);
        }
        if (this.config.tools.applyGatedAction) {
            registerApplyGatedActionTool(registry);
        }
        if (this.config.tools.searchNodes) {
            registerSearchNodesTool(registry);
        }

        // Core tools
        if (this.config.tools.createNodes) {
            registerCreateNodesTool(registry);
        }
        if (this.config.tools.modifyNodes) {
            registerModifyNodesTool(registry);
        }
        if (this.config.tools.queryNodes) {
            registerQueryNodesTool(registry);
        }
        if (this.config.tools.queryComponents) {
            registerQueryComponentsTool(registry);
        }
        if (this.config.tools.modifyComponents) {
            registerModifyComponentsTool(registry);
        }

        // Scene and asset tools
        if (this.config.tools.operateCurrentScene) {
            registerOperateCurrentSceneTool(registry);
        }
        if (this.config.tools.operatePrefabAssets) {
            registerOperatePrefabAssetsTool(registry);
        }
        if (this.config.tools.operateAssets) {
            registerOperateAssetsTool(registry);
        }
        if (this.config.tools.nodeLinkedPrefabsOperations) {
            registerNodeLinkedPrefabsOperationsTool(registry);
        }

        // Discovery tools
        if (this.config.tools.getAvailableComponentTypes) {
            registerGetAvailableComponentTypesTool(registry);
        }
        if (this.config.tools.getAvailableAssetTypes) {
            registerGetAvailableAssetTypesTool(registry);
        }
        if (this.config.tools.getAssetsByType) {
            registerGetAssetsByTypeTool(registry);
        }

        // Project tools
        if (this.config.tools.operateProjectSettings) {
            registerOperateProjectSettingsTool(registry);
        }

        // File system tools
        if (this.config.tools.operateScriptsAndText) {
            registerOperateScriptsAndTextTool(registry);
        }

        // Code execution tools
        if (this.config.tools.executeSceneCode) {
            registerExecuteSceneCodeTool(registry);
        }

        console.log(`Registered ${this.toolRegistry.getToolNames().length} tools`);
    }

    /**
     * Set up Express routes
     */
    private setupRoutes(): void {
        if (!this.expressApp) return;

        // CORS middleware
        this.expressApp.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
                return;
            }
            next();
        });

        this.expressApp.use(express.json({ limit: '10mb' }));

        // Health check
        this.expressApp.get('/cocos/health', (req, res) => {
            res.json({
                status: 'ok',
                port: this.config.port,
                tools: this.toolRegistry.getToolNames(),
                version: this.config.version
            });
        });

        // List available tools
        this.expressApp.get('/cocos/tools', (req, res) => {
            const tools = this.toolRegistry.getAllTools().map(t => ({
                name: t.name,
                title: t.title,
                description: t.description
            }));
            res.json({ tools });
        });

        // Set up route-to-tool mappings
        for (const [route, toolName] of Object.entries(ROUTE_TO_TOOL)) {
            // GET for discovery endpoints, POST for others
            const isGetRoute = route.includes('/discovery/') && !route.includes('by-type');
            const method = isGetRoute ? 'get' : 'post';

            (this.expressApp as any)[method](route, async (req: express.Request, res: express.Response) => {
                try {
                    const args = method === 'get' ? req.query : req.body;
                    const result = await this.toolRegistry.execute(toolName, args || {});
                    res.json(result);
                } catch (error) {
                    console.error(`Error executing ${toolName}:`, error);
                    res.status(500).json({
                        error: error instanceof Error ? error.message : String(error),
                        tool: toolName
                    });
                }
            });
        }

        // Also allow GET for context endpoint
        this.expressApp.get('/cocos/context', async (req, res) => {
            try {
                const result = await this.toolRegistry.execute('get_editor_context', req.query || {});
                res.json(result);
            } catch (error) {
                console.error('Error executing get_editor_context:', error);
                res.status(500).json({
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });

        // Generic tool endpoint
        this.expressApp.post('/cocos/tool/:toolName', async (req, res) => {
            const { toolName } = req.params;
            try {
                if (!this.toolRegistry.hasTool(toolName)) {
                    res.status(404).json({ error: `Tool not found: ${toolName}` });
                    return;
                }
                const result = await this.toolRegistry.execute(toolName, req.body || {});
                res.json(result);
            } catch (error) {
                console.error(`Error executing ${toolName}:`, error);
                res.status(500).json({
                    error: error instanceof Error ? error.message : String(error),
                    tool: toolName
                });
            }
        });
    }

    public updateConfig(config: Partial<McpServerConfig>): void {
        this.config = {
            ...this.config,
            ...config,
            tools: { ...this.config.tools, ...config.tools },
            imageGeneration: { ...this.config.imageGeneration, ...config.imageGeneration }
        };
        this.imageGenerationService.updateConfig(this.config.imageGeneration);
        this.configStorage.saveConfig(this.config);
    }

    public getConfig(): McpServerConfig {
        return { ...this.config };
    }

    public getServerInfo(): { isRunning: boolean; config: McpServerConfig } {
        return {
            isRunning: this.isRunning,
            config: this.getConfig()
        };
    }

    public getImageGenerationService(): ImageGenerationService {
        return this.imageGenerationService;
    }

    public getImageConfig() {
        return this.config.imageGeneration;
    }

    public async saveImageConfig(imageConfig: any) {
        this.config.imageGeneration = imageConfig.imageGeneration || imageConfig;
        this.imageGenerationService.updateConfig(this.config.imageGeneration);
        this.configStorage.saveConfig(this.config);
    }

    public async testImageProvider(providerId: string, testPrompt: string = 'A simple test image') {
        try {
            return await this.imageGenerationService.testProvider(providerId, testPrompt);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    public async fetchProviderModels(providerId: string) {
        try {
            return await this.imageGenerationService.fetchAvailableModels(providerId);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    public async resetImageConfig() {
        this.config.imageGeneration = { ...DEFAULT_SERVER_CONFIG.imageGeneration };
        this.imageGenerationService.updateConfig(this.config.imageGeneration);
        this.configStorage.saveConfig(this.config);
    }

    public isServerRunning(): boolean {
        return this.isRunning;
    }

    public async startServer(): Promise<void> {
        if (this.isRunning) {
            console.log('HTTP server is already running, skipping start');
            return;
        }

        try {
            // Register tools
            this.registerTools();

            // Create Express app
            this.expressApp = express();
            this.setupRoutes();

            // Create HTTP server
            this.httpServer = createServer(this.expressApp);

            // Try to start server with auto port increment
            const maxRetries = 10;
            let currentPort = this.config.port;
            let started = false;

            for (let attempt = 0; attempt < maxRetries && !started; attempt++) {
                try {
                    await new Promise<void>((resolve, reject) => {
                        this.httpServer!.once('error', (error: NodeJS.ErrnoException) => {
                            if (error.code === 'EADDRINUSE') {
                                console.warn(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
                                currentPort++;
                                resolve();
                            } else {
                                reject(error);
                            }
                        });

                        this.httpServer!.listen(currentPort, () => {
                            started = true;
                            resolve();
                        });
                    });

                    if (!started) {
                        this.httpServer.close();
                        this.httpServer = createServer(this.expressApp);
                    }
                } catch (error) {
                    throw error;
                }
            }

            if (!started) {
                throw new Error(`Failed to find available port after ${maxRetries} attempts`);
            }

            // Update config with actual port if changed
            if (currentPort !== this.config.port) {
                console.log(`Port changed from ${this.config.port} to ${currentPort}`);
                this.config.port = currentPort;
                this.configStorage.saveConfig(this.config);
            }

            this.isRunning = true;
            console.log(`HTTP tool server started on port ${this.config.port}`);
            console.log(`Available endpoints: /cocos/health, /cocos/tools, /cocos/context, ...`);
        } catch (error) {
            this.isRunning = false;
            this.httpServer = null;
            this.expressApp = null;
            throw error;
        }
    }

    public async stopServer(): Promise<void> {
        if (!this.isRunning) {
            console.log('HTTP server is not running, skipping stop');
            return;
        }

        try {
            if (this.httpServer) {
                await new Promise<void>((resolve) => {
                    this.httpServer!.close(() => resolve());
                });
                this.httpServer = null;
            }

            this.expressApp = null;
            this.isRunning = false;
            console.log('HTTP tool server stopped');
        } catch (error) {
            console.error('Error stopping HTTP server:', error);
            throw error;
        }
    }

    // UUID encoding utilities (for compatibility with existing tools)
    public static encodeUuid(uuid: string): string {
        return uuid.includes('@') ? btoa(uuid) : uuid;
    }

    public static decodeUuid(encodedUuid: string): string {
        if (HttpToolServer.isBase64(encodedUuid)) {
            const decodedUuid = atob(encodedUuid);
            if (decodedUuid.includes('@')) {
                return decodedUuid;
            }
        }
        return encodedUuid;
    }

    private static isBase64(str: string): boolean {
        if (!str || str.length % 4 !== 0) return false;
        const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
        return base64Regex.test(str);
    }
}
