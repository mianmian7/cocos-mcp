import { ExecuteSceneScriptMethodOptions } from '@cocos/creator-types/editor/packages/scene/@types/public';
import packageJSON from '../package.json';
import { DEFAULT_IMAGE_GENERATION_CONFIG } from './mcp/config.js';
import { ConfigStorage } from './mcp/config-storage.js';

// Try importing the HTTP server
let HttpToolServer: any = null;
let httpServer: any = null;

// Lazy load the HTTP server to avoid immediate import issues
async function getHttpServer() {
    if (!HttpToolServer) {
        try {
            const module = await import('./http/http-tool-server.js');
            HttpToolServer = module.HttpToolServer;
        } catch (error) {
            console.error('Failed to import HttpToolServer:', error);
            throw error;
        }
    }

    if (!httpServer) {
        httpServer = new HttpToolServer();
    }

    return httpServer;
}

/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export const load: () => void = function () {
    console.log('Cocos HTTP Extension loaded');

    // Ensure config file exists for CLI/HTTP client configuration
    try {
        const configStorage = new ConfigStorage();
        configStorage.ensureMcpJson();
        console.log('HTTP server configuration is ready');
    } catch (error) {
        console.warn('Failed to ensure config:', error);
    }

    // Auto-start HTTP server if configured
    (async () => {
        try {
            const server = await getHttpServer();
            const info = server.getServerInfo();

            if (info.config.autoStart && !info.isRunning) {
                console.log('Auto-starting HTTP tool server...');
                await server.startServer();
                console.log('HTTP tool server auto-started successfully');
            }
        } catch (error) {
            console.error('Failed to auto-start HTTP tool server:', error);
        }
    })();
};

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export const unload: () => Promise<void> = async function () {
    try {
        const result = await methods.stopHttpServer();
        if (result?.success === false) {
            console.error('Failed to stop HTTP server during unload:', result.message);
        }
    } catch (error) {
        console.error('Error stopping HTTP server during unload:', error);
    }

    console.log('Cocos MCP Extension unloaded');
};

export const methods: Record<string, (...args: any[]) => any> = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },

    /**
     * Open image generator panel for SVG processing
     */
    async openImageGeneratorPanel() {
        await Editor.Panel.open(`${packageJSON.name}.image-generator`);
    },

    /**
     * Open AI configuration panel
     */
    async openAiConfigPanel() {
        await Editor.Panel.open(`${packageJSON.name}.ai-config`);
    },

    /**
     * Get AI image generation configuration
     */
    async getImageConfig() {
        try {
            const server = await getHttpServer();
            return server.getImageConfig();
        } catch (error) {
            console.error('Error getting image config:', error);
            return {
                ...DEFAULT_IMAGE_GENERATION_CONFIG,
                providers: [...DEFAULT_IMAGE_GENERATION_CONFIG.providers]
            };
        }
    },

    /**
     * Save AI image generation configuration
     */
    async saveImageConfig(config: any) {
        try {
            const server = await getHttpServer();
            await server.saveImageConfig(config);
            return { success: true };
        } catch (error) {
            console.error('Error saving image config:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Test AI provider connection
     */
    async testProvider(params: { providerId: string; testPrompt: string }) {
        try {
            const server = await getHttpServer();
            const result = await server.testImageProvider(params.providerId, params.testPrompt);
            return result;
        } catch (error) {
            console.error('Error testing provider:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Fetch available models from AI provider
     */
    async fetchProviderModels(params: { providerId: string }) {
        try {
            const server = await getHttpServer();
            const result = await server.fetchProviderModels(params.providerId);
            return result;
        } catch (error) {
            console.error('Error fetching provider models:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Reset AI configuration to defaults
     */
    async resetImageConfig() {
        try {
            const server = await getHttpServer();
            await server.resetImageConfig();
            return { success: true };
        } catch (error) {
            console.error('Error resetting image config:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Start HTTP tool server
     */
    async startHttpServer(config: any) {
        try {
            console.log('Starting HTTP tool server with config:', config);

            const server = await getHttpServer();
            if (config) {
                server.updateConfig(config);
            }
            await server.startServer();

            return { success: true, message: "HTTP tool server started successfully" };
        } catch (error) {
            console.error('Error starting HTTP tool server:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Stop HTTP tool server
     */
    async stopHttpServer() {
        try {
            if (httpServer) {
                await httpServer.stopServer();
                return { success: true, message: "HTTP tool server stopped successfully" };
            }
            return { success: true, message: "HTTP tool server was not running" };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error)
            };
        }
    },

    /**
     * Get HTTP server status and configuration
     */
    async getHttpServerInfo() {
        try {
            const server = await getHttpServer();
            const info = server.getServerInfo();
            return {
                isRunning: info.isRunning,
                config: info.config
            };
        } catch (error) {
            console.error('Error getting server info:', error);
            return {
                isRunning: false,
                config: {
                    port: 3000,
                    name: "cocos-mcp-server",
                    version: "1.0.2",
                    tools: {
                        createNodes: true,
                        modifyNodes: true,
                        queryNodes: true,
                        queryComponents: true,
                        modifyComponents: true,
                        operateCurrentScene: true,
                        operatePrefabAssets: true,
                        operateAssets: true,
                        nodeLinkedPrefabsOperations: true,
                        getAvailableComponentTypes: true,
                        getAvailableAssetTypes: true,
                        getAssetsByType: true,
                        generateImageAsset: true,
                        operateProjectSettings: true,
                        operateScriptsAndText: true
                    }
                }
            };
        }
    },

    /**
     * Update HTTP server configuration
     */
    async updateHttpServerConfig(config: any) {
        try {
            const server = await getHttpServer();
            server.updateConfig(config);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error)
            };
        }
    },

    // Backward compatibility aliases (keep old names working)
    async startMcpServer(config: any) {
        return methods.startHttpServer(config);
    },

    async stopMcpServer() {
        return methods.stopHttpServer();
    },

    async getMcpServerInfo() {
        return methods.getHttpServerInfo();
    },

    async updateMcpServerConfig(config: any) {
        return methods.updateHttpServerConfig(config);
    },

    // Alternative method names for the UI
    'start-mcp-server': async function (config: any) {
        return methods.startHttpServer(config);
    },

    'stop-mcp-server': async function () {
        return methods.stopHttpServer();
    },

    'get-mcp-server-info': async function () {
        return methods.getHttpServerInfo();
    },

    'update-mcp-server-config': async function (config: any) {
        return methods.updateHttpServerConfig(config);
    },

    // AI Configuration method aliases
    'get-image-config': async function () {
        return methods.getImageConfig();
    },

    'save-image-config': async function (config: any) {
        return methods.saveImageConfig(config);
    },

    'test-provider': async function (params: { providerId: string; testPrompt: string }) {
        return methods.testProvider(params);
    },

    'fetch-provider-models': async function (params: { providerId: string }) {
        return methods.fetchProviderModels(params);
    },

    'reset-image-config': async function () {
        return methods.resetImageConfig();
    }
};