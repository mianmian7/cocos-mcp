import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { McpServerConfig, DEFAULT_SERVER_CONFIG } from './config.js';

/**
 * MCP JSON configuration interface for AI clients
 */
interface McpJsonConfig {
    mcpServers: {
        'cocos-creator': {
            type: string;
            url: string;
        };
    };
}

/**
 * Configuration storage manager for persisting MCP server settings
 */
export class ConfigStorage {
    private configPath: string;
    private mcpJsonPath: string;
    private projectPath: string;

    constructor() {
        // Store config in the editor's profile directory
        this.projectPath = Editor.Project.path;
        this.configPath = path.join(this.projectPath, '.cocos-mcp-config.json');
        this.mcpJsonPath = path.join(this.projectPath, '.mcp.json');
    }

    /**
     * Generate a deterministic port based on project path
     * Uses hash of project path to ensure same project always gets same port
     * Port range: 3000-3999 (1000 ports available)
     */
    generateSmartPort(): number {
        const hash = crypto.createHash('md5').update(this.projectPath).digest('hex');
        // Take first 8 characters of hash and convert to number
        const hashNum = parseInt(hash.substring(0, 8), 16);
        // Map to port range 3000-3999
        const port = 3000 + (hashNum % 1000);
        return port;
    }

    /**
     * Load configuration from disk
     * For new projects, generates a smart port based on project path
     */
    loadConfig(): McpServerConfig {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8');
                const savedConfig = JSON.parse(configData);

                // Merge with defaults to ensure all properties exist
                const mergedConfig = {
                    ...DEFAULT_SERVER_CONFIG,
                    ...savedConfig,
                    tools: {
                        ...DEFAULT_SERVER_CONFIG.tools,
                        ...savedConfig.tools
                    },
                    imageGeneration: {
                        ...DEFAULT_SERVER_CONFIG.imageGeneration,
                        ...savedConfig.imageGeneration,
                        providers: savedConfig.imageGeneration?.providers || DEFAULT_SERVER_CONFIG.imageGeneration.providers
                    }
                };

                return mergedConfig;
            }
        } catch (error) {
            console.warn('Failed to load MCP config, using defaults:', error);
        }

        // First time setup: use smart port for new projects
        const smartPort = this.generateSmartPort();
        const newConfig = {
            ...DEFAULT_SERVER_CONFIG,
            port: smartPort
        };

        // Save the new config immediately so the smart port is persisted
        this.saveConfig(newConfig);

        return newConfig;
    }

    /**
     * Save configuration to disk
     * Also updates .mcp.json to keep AI client config in sync
     */
    saveConfig(config: McpServerConfig): boolean {
        try {
            const configData = JSON.stringify(config, null, 2);
            fs.writeFileSync(this.configPath, configData, 'utf8');

            // Sync .mcp.json with current port
            this.updateMcpJson(config.port);

            return true;
        } catch (error) {
            console.error('Failed to save MCP config:', error);
            return false;
        }
    }

    /**
     * Generate or update .mcp.json file for AI client configuration
     * This file tells AI tools how to connect to the Cocos MCP server
     */
    updateMcpJson(port: number): boolean {
        try {
            const mcpConfig: McpJsonConfig = {
                mcpServers: {
                    'cocos-creator': {
                        type: 'http',
                        url: `http://127.0.0.1:${port}/mcp`
                    }
                }
            };

            const configData = JSON.stringify(mcpConfig, null, 2);
            fs.writeFileSync(this.mcpJsonPath, configData, 'utf8');
            console.log(`Updated .mcp.json with port ${port}`);
            return true;
        } catch (error) {
            console.error('Failed to update .mcp.json:', error);
            return false;
        }
    }

    /**
     * Ensure .mcp.json exists and is up to date
     * Called during extension load to guarantee AI client can find config
     */
    ensureMcpJson(): boolean {
        try {
            const config = this.loadConfig();
            return this.updateMcpJson(config.port);
        } catch (error) {
            console.error('Failed to ensure .mcp.json:', error);
            return false;
        }
    }

    /**
     * Check if .mcp.json file exists
     */
    mcpJsonExists(): boolean {
        return fs.existsSync(this.mcpJsonPath);
    }

    /**
     * Check if config file exists
     */
    configExists(): boolean {
        return fs.existsSync(this.configPath);
    }

    /**
     * Delete configuration file
     */
    deleteConfig(): boolean {
        try {
            if (fs.existsSync(this.configPath)) {
                fs.unlinkSync(this.configPath);
            }
            return true;
        } catch (error) {
            console.error('Failed to delete MCP config:', error);
            return false;
        }
    }
}
