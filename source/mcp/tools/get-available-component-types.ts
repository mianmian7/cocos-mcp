import { ExecuteSceneScriptMethodOptions } from "@cocos/creator-types/editor/packages/scene/@types/public";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';

export function registerGetAvailableComponentTypesTool(server: McpServer): void {
  server.registerTool(
    "get_available_component_types",
    {
      title: "Get Available Component Types",
      description: "Returns all available component types in the project",
      inputSchema: {
        // No input parameters needed
      }
    },
    async (args) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let componentTypes: Array<string> = [];

        try {
          const options: ExecuteSceneScriptMethodOptions = {
              name: packageJSON.name,
              method: 'queryComponentTypes',
              args: []
          };
          componentTypes = await Editor.Message.request('scene', 'execute-scene-script', options);
        } catch (queryError) {
          errors.push(`Error querying component types: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
        }

        // Build response message
        let message = '';
        
        if (componentTypes.length > 0) {
          message = componentTypes.join(', ');
        } else {
          message = 'No component types found';
        }

        if (errors.length > 0) {
          message += `\n\nWarnings/Errors:\n${errors.join('\n')}`;
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
        
        let errorMessage = `Error retrieving component types: ${error instanceof Error ? error.message : String(error)}`;
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