import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { randomUUID } from 'crypto';

// Import all resources
import { registerDatabaseResource } from "./resources/database.js";

// Import all new tools
import { registerInspectNodeHierarchyTool } from "./tools/inspect-node-hierarchy.js";
import { registerCreateNodesTool } from "./tools/create-nodes.js";
import { registerSetNodesPropertiesTool } from "./tools/set-nodes-properties.js";
import { registerOperateNodesTool } from "./tools/operate-nodes.js";
import { registerCreatePrefabFromNodeTool } from "./tools/create-prefab-from-node.js";
import { registerNodeLinkedPrefabsOperationsTool } from "./tools/node-linked-prefabs-operations.js";
import { registerGetAvailableComponentTypesTool } from "./tools/get-available-component-types.js";
import { registerAddComponentsToNodesTool } from "./tools/add-components-to-nodes.js";
import { registerRemoveComponentsTool } from "./tools/remove-components.js";
import { registerInspectComponentsPropertiesTool } from "./tools/inspect-components-properties.js";
import { registerSetComponentsPropertiesTool } from "./tools/set-components-properties.js";
import { registerGetAvailableAssetTypesTool } from "./tools/get-available-asset-types.js";
import { registerOperateAssetTool } from "./tools/operate-asset.js";
import { registerGetAssetsByTypeTool } from "./tools/get-assets-by-type.js";
import { registerCreateAssetFromTemplateTool } from "./tools/create-asset-from-template.js";
import { registerGenerateImageAssetTool } from "./tools/generate-image-asset.js";
import { registerOpenSceneTool } from "./tools/open-scene.js";
import { registerSaveCurrentSceneOrPrefabTool } from "./tools/save-current-scene-or-prefab.js";
import { registerOpenPrefabTool } from "./tools/open-prefab.js";
import { registerClosePrefabTool } from "./tools/close-prefab.js";
import { registerSetMaterialsPropertiesTool } from "./tools/set-materials-properties.js";
import { registerOperateProjectSettingsTool } from "./tools/operate-project-settings.js";
import { register } from "module";

export interface ServerConfig {
  port: number;
  name?: string;
  version?: string;
}

export class McpServerManager {
  private server: McpServer | null = null;
  private transport: StreamableHTTPServerTransport | null = null;
  private httpServer: HttpServer | null = null;
  private expressApp: express.Application | null = null;
  private config: ServerConfig = { port: 3000, name: "cocos-mcp-server", version: "1.0.0" };
  private isRunning: boolean = false;
  private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  constructor() {}

  private createMcpServer(): McpServer {
    const server = new McpServer({
      name: this.config.name!,
      version: this.config.version!
    });

    // Register all resources
    registerDatabaseResource(server);

    // Register all new tools
    registerInspectNodeHierarchyTool(server);
    registerCreateNodesTool(server);
    registerSetNodesPropertiesTool(server);
    registerOperateNodesTool(server);
    registerCreatePrefabFromNodeTool(server);
    registerNodeLinkedPrefabsOperationsTool(server);
    registerGetAvailableComponentTypesTool(server);
    registerAddComponentsToNodesTool(server);
    registerRemoveComponentsTool(server);
    registerInspectComponentsPropertiesTool(server);
    registerSetComponentsPropertiesTool(server);
    registerGetAvailableAssetTypesTool(server);
    registerOperateAssetTool(server);
    registerGetAssetsByTypeTool(server);
    registerCreateAssetFromTemplateTool(server);
    registerGenerateImageAssetTool(server);
    registerOpenSceneTool(server);
    registerSaveCurrentSceneOrPrefabTool(server);
    registerOpenPrefabTool(server);
    registerClosePrefabTool(server);
    registerSetMaterialsPropertiesTool(server);
    registerOperateProjectSettingsTool(server);

    return server;
  }

  public updateConfig(config: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ServerConfig {
    return { ...this.config };
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }

  public async startServer(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Server is already running");
    }

    try {
      // Create Express app
      this.expressApp = express();
      this.expressApp.use(express.json());
      
      // Add CORS headers
      this.expressApp.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, mcp-session-id');
        next();
      });

      // Handle POST requests for client-to-server communication
      this.expressApp.post('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;
        let server: McpServer;

        if (sessionId && this.transports[sessionId]) {
          // Reuse existing transport
          transport = this.transports[sessionId];
          server = this.server!; // Use the global server instance
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          server = this.createMcpServer();
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              this.transports[sessionId] = transport;
            }
          });

          // Clean up transport when closed
          transport.onclose = () => {
            const sessionId = Object.keys(this.transports).find(
              id => this.transports[id] === transport
            );
            if (sessionId) {
              delete this.transports[sessionId];
            }
          };

          await server.connect(transport);
        } else {
          // Invalid request - no session ID and not an initialize request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Invalid Request: Missing session ID or not an initialize request',
            },
            id: null,
          });
          return;
        }

        try {
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          console.error('Error handling MCP request:', error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
              },
              id: null,
            });
          }
        }
      });

      // Handle GET requests for SSE notifications  
      this.expressApp.get('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string;
        const transport = this.transports[sessionId];
        
        if (transport) {
          try {
            // Note: handleSSE might not be available in current SDK version
            // This is a placeholder for SSE support
            res.status(501).json({
              jsonrpc: '2.0',
              error: {
                code: -32001,
                message: 'SSE not implemented',
              },
              id: null,
            });
          } catch (error) {
            console.error('Error handling SSE request:', error);
            if (!res.headersSent) {
              res.status(500).end();
            }
          }
        } else {
          res.status(404).json({
            jsonrpc: '2.0',
            error: {
              code: -32002,
              message: 'Session not found',
            },
            id: null,
          });
        }
      });

      // Create and start HTTP server
      this.httpServer = createServer(this.expressApp);
      
      await new Promise<void>((resolve, reject) => {
        this.httpServer!.listen(this.config.port, () => {
          resolve();
        }).on('error', (error) => {
          reject(error);
        });
      });

      // Create a default server instance for server info
      this.server = this.createMcpServer();
      this.isRunning = true;

      console.log(`MCP server started on port ${this.config.port}`);
    } catch (error) {
      this.isRunning = false;
      this.server = null;
      this.transport = null;
      this.httpServer = null;
      this.expressApp = null;
      this.transports = {};
      throw error;
    }
  }

  public async stopServer(): Promise<void> {
    if (!this.isRunning) {
      throw new Error("Server is not running");
    }

    try {
      // Close all transports
      for (const transport of Object.values(this.transports)) {
        try {
          await transport.close();
        } catch (error) {
          console.error("Error closing transport:", error);
        }
      }
      this.transports = {};

      // Close HTTP server
      if (this.httpServer) {
        await new Promise<void>((resolve) => {
          this.httpServer!.close(() => resolve());
        });
        this.httpServer = null;
      }

      this.server = null;
      this.transport = null;
      this.expressApp = null;
      this.isRunning = false;
      
      console.log("MCP server stopped");
    } catch (error) {
      console.error("Error stopping server:", error);
      throw error;
    }
  }

  public getServerInfo(): { isRunning: boolean; config: ServerConfig } {
    return {
      isRunning: this.isRunning,
      config: this.getConfig()
    };
  }

  public static encodeUuid(uuid: string): string {
    return uuid.includes("@") ? btoa(uuid) : uuid;
  }

  public static decodeUuid(encodedUuid: string): string {
    if (McpServerManager.isBase64(encodedUuid)) {
      const decodedUuid = atob(encodedUuid);
      if (decodedUuid.includes("@")) {
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