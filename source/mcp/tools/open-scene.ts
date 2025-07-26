import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerOpenSceneTool(server: McpServer): void {
  server.registerTool(
    "open_scene",
    {
      title: "Open Scene",
      description: "Opens a scene by asset UUID or path",
      inputSchema: {
        sceneIdentifier: z.string().describe("UUID or URL to open (e.g., UUID or 'db://assets/Scene.scene')")
      }
    },
    async ({ sceneIdentifier }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let sceneOpened = false;
        let sceneInfo: any = null;

        try {
          let sceneUuid: string | undefined;

          // Determine if sceneIdentifier is UUID or URL
          if (sceneIdentifier.startsWith('db://')) {
            // It's a URL, get the UUID
            const queryResult = await Editor.Message.request('asset-db', 'query-uuid', sceneIdentifier);
            if (!queryResult) {
              errors.push(`Scene asset not found at URL: ${sceneIdentifier}`);
            } else {
              sceneUuid = queryResult;
            }
          } else {
            // It's a UUID
            sceneUuid = McpServerManager.decodeUuid(sceneIdentifier);
            
            // Verify the UUID exists
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', sceneUuid);
            if (!assetInfo) {
              errors.push(`Scene asset not found for UUID: ${sceneIdentifier}`);
            } else {
              sceneInfo = assetInfo;
            }
          }

          if (sceneUuid && !errors.length) {
            // Open scene using Cocos Creator API
            await Editor.Message.request('scene', 'open-scene', sceneUuid);
            sceneOpened = true;

            // Get scene info if not already retrieved
            if (!sceneInfo) {
              try {
                sceneInfo = await Editor.Message.request('asset-db', 'query-asset-info', sceneUuid);
              } catch (infoError) {
                console.warn('Could not retrieve scene info after opening:', infoError);
              }
            }
          }

        } catch (openError) {
          errors.push(`Error opening scene: ${openError instanceof Error ? openError.message : String(openError)}`);
        }

        // Build response message
        let message = '';
        
        if (sceneOpened) {
          message = `Successfully opened scene:\n`;
          if (sceneInfo) {
            message += `- Scene URL: ${sceneInfo.url}\n`;
            message += `- Scene UUID: ${McpServerManager.encodeUuid(sceneInfo.uuid)}\n`;
          }
          
          message += `\nThe scene is now loaded in the editor and ready for editing.`;
        } else {
          message = `Failed to open scene '${sceneIdentifier}'`;
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
        
        let errorMessage = `Error opening scene: ${error instanceof Error ? error.message : String(error)}`;
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