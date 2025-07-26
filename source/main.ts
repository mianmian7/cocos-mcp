import { ExecuteSceneScriptMethodOptions } from '@cocos/creator-types/editor/packages/scene/@types/public';
import packageJSON from '../package.json';

// Try importing the server manager
let McpServerManager: any = null;
let serverManager: any = null;

// Lazy load the server manager to avoid immediate import issues
async function getServerManager() {
    if (!McpServerManager) {
        try {
            const module = await import('./mcp/server-manager');
            McpServerManager = module.McpServerManager;
        } catch (error) {
            console.error('Failed to import McpServerManager:', error);
            throw error;
        }
    }
    
    if (!serverManager) {
        serverManager = new McpServerManager();
    }
    
    return serverManager;
}

/**
 * @en Method Triggered on Extension Startup
 * @zh 扩展启动时触发的方法
 */
export const load: () => void = function () {
    console.log('MCP Extension loaded');
};

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export const unload: () => void = function () {
    methods.stopMcpServer();
    console.log('MCP Extension unloaded');
};

export const methods: Record<string, (...args: any[]) => any> = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },

    /**
     * Start MCP server
     */
    async startMcpServer(config: any) {
        try {
            console.log('Starting MCP server with config:', config);
            
            // Ensure config is serializable and clean
            const cleanConfig = {
                port: Number(config?.port) || 3000,
                name: String(config?.name) || 'cocos-mcp-server',
                version: String(config?.version) || '1.0.0'
            };
            
            const manager = await getServerManager();
            manager.updateConfig(cleanConfig);
            await manager.startServer();
            
            return { success: true, message: "MCP server started successfully" };
        } catch (error) {
            console.error('Error starting MCP server:', error);
            return { 
                success: false, 
                message: error instanceof Error ? error.message : String(error) 
            };
        }
    },

    /**
     * Stop MCP server  
     */
    async stopMcpServer() {
        try {
            if (serverManager) {
                await serverManager.stopServer();
                return { success: true, message: "MCP server stopped successfully" };
            }
            return { success: true, message: "MCP server was not running" };
        } catch (error) {
            return { 
                success: false, 
                message: error instanceof Error ? error.message : String(error) 
            };
        }
    },

    /**
     * Get MCP server status and configuration
     */
    async getMcpServerInfo() {
        try {
            const manager = await getServerManager();
            const info = manager.getServerInfo();
            // Return a clean copy to avoid any cloning issues
            return {
                isRunning: !!info.isRunning,
                config: {
                    port: info.config.port || 3000,
                    name: info.config.name || "cocos-mcp-server",
                    version: info.config.version || "1.0.0"
                }
            };
        } catch (error) {
            console.error('Error getting server info:', error);
            return {
                isRunning: false,
                config: { port: 3000, name: "cocos-mcp-server", version: "1.0.0" }
            };
        }
    },

    /**
     * Update MCP server configuration
     */
    async updateMcpServerConfig(config: any) {
        try {
            // Ensure config is serializable and clean
            const cleanConfig = {
                port: Number(config?.port) || 3000,
                name: String(config?.name) || 'cocos-mcp-server',
                version: String(config?.version) || '1.0.0'
            };
            
            const manager = await getServerManager();
            manager.updateConfig(cleanConfig);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error instanceof Error ? error.message : String(error) 
            };
        }
    },

    // Alternative method names for the UI
    'start-mcp-server': async function(config: any) {
        return this.startMcpServer(config);
    },

    'stop-mcp-server': async function() {
        return this.stopMcpServer();
    },

    'get-mcp-server-info': async function() {
        return this.getMcpServerInfo();
    },

    'update-mcp-server-config': async function(config: any) {
        return this.updateMcpServerConfig(config);
    }
};