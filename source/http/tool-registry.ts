/**
 * Tool Registry - Adapter for reusing MCP tool implementations without MCP SDK
 * 
 * This module provides a simplified tool registration interface that mirrors
 * the MCP SDK's registerTool API, allowing existing tool implementations to
 * be reused with the new HTTP server.
 */

import { z } from 'zod';

/**
 * Standard tool result format (compatible with MCP)
 */
export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * Tool definition with schema and handler
 */
export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  handler: (args: any) => Promise<ToolResult>;
}

/**
 * Mock McpServer-like interface for tool registration
 * Allows reusing existing tool registrations without modification
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  /**
   * Register a tool (compatible with MCP SDK's registerTool API)
   */
  registerTool(
    name: string,
    definition: {
      title: string;
      description: string;
      inputSchema: Record<string, z.ZodTypeAny>;
    },
    handler: (args: any) => Promise<ToolResult>
  ): void {
    this.tools.set(name, {
      name,
      title: definition.title,
      description: definition.description,
      inputSchema: definition.inputSchema,
      handler
    });
  }

  /**
   * Get a registered tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Execute a tool by name with given arguments
   */
  async execute(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      // Validate input against schema
      const schema = z.object(tool.inputSchema);
      const validatedArgs = schema.parse(args);
      
      // Execute handler
      const result = await tool.handler(validatedArgs);
      
      // Extract text content from MCP-format result
      if (result.content && result.content.length > 0) {
        const textContent = result.content.find(c => c.type === 'text');
        if (textContent?.text) {
          try {
            return JSON.parse(textContent.text);
          } catch {
            return textContent.text;
          }
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}

// Global registry instance
let globalRegistry: ToolRegistry | null = null;

/**
 * Get or create the global tool registry
 */
export function getToolRegistry(): ToolRegistry {
  if (!globalRegistry) {
    globalRegistry = new ToolRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global registry (for testing)
 */
export function resetToolRegistry(): void {
  globalRegistry = null;
}
