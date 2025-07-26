import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerRemoveComponentsTool(server: McpServer): void {
  server.registerTool(
    "remove_components",
    {
      title: "Batch Remove Components",
      description: "Removes components by their UUIDs",
      inputSchema: {
        componentUuids: z.array(z.string())
      }
    },
    async ({ componentUuids }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const results: Array<{ componentUuid: string; success: boolean; error?: string }> = [];
        const globalErrors: string[] = [];

        // Process each component
        for (const componentUuid of componentUuids) {
          const componentResult: {
            componentUuid: string;
            success: boolean;
            error?: string;
          } = {
            componentUuid: componentUuid,
            success: false
          };

          try {
            const decodedUuid = McpServerManager.decodeUuid(componentUuid);

            // Verify component exists first
            const componentInfo = await Editor.Message.request('scene', 'query-component', decodedUuid);
            if (!componentInfo) {
              componentResult.error = `Component with UUID ${componentUuid} not found`;
              results.push(componentResult);
              continue;
            }

            // Remove component
            await Editor.Message.request('scene', 'remove-component', {
              uuid: decodedUuid
            });

            componentResult.success = true;

          } catch (componentError) {
            componentResult.error = `Failed to remove component: ${componentError instanceof Error ? componentError.message : String(componentError)}`;
          }

          results.push(componentResult);
        }

        // Build response message
        let message = "";

        results.forEach((result, index) => {
          message += `Component ${index + 1} (UUID: ${result.componentUuid})`;
          if (result.success) {
            message += ` removed\n`;
          } else {
            message += ` failed to remove (${result.error})\n`;
          }
        });

        if (globalErrors.length > 0) {
          message += `\n\nGlobal Errors:\n${globalErrors.join('\n')}`;
        }

        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        capturedLogs.forEach(log => message += ("\n" + log));

        return {
          content: [{
            type: "text",
            text: message
          }]
        };

      } catch (error) {
        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        
        let errorMessage = `Error removing components: ${error instanceof Error ? error.message : String(error)}`;
        capturedLogs.forEach(log => errorMessage += ("\n" + log));

        return {
          content: [{
            type: "text",
            text: errorMessage
          }]
        };
      }
    }
  );
}