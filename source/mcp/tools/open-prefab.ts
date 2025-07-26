import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerOpenPrefabTool(server: McpServer): void {
  server.registerTool(
    "open_prefab",
    {
      title: "Open Prefab",
      description: "Open a prefab for editing by asset UUID or URL.",
      inputSchema: {
        prefabIdentifier: z.string().describe("UUID or URL to open for editing (e.g., UUID or 'db://assets/MyPrefab.prefab')")
      }
    },
    async ({ prefabIdentifier }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let prefabOpened = false;
        let prefabInfo: any = null;

        try {
          let prefabUuid: string | undefined;

          // Determine if prefabIdentifier is UUID or URL
          if (prefabIdentifier.startsWith('db://')) {
            // It's a URL, get the UUID
            const queryResult = await Editor.Message.request('asset-db', 'query-uuid', prefabIdentifier);
            if (!queryResult) {
              errors.push(`Prefab asset not found at URL: ${prefabIdentifier}`);
            } else {
              prefabUuid = queryResult;
            }
          } else {
            // It's a UUID
            prefabUuid = McpServerManager.decodeUuid(prefabIdentifier);
            
            // Verify the UUID exists
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabUuid);
            if (!assetInfo) {
              errors.push(`Prefab asset not found for UUID: ${prefabIdentifier}`);
            } else {
              prefabInfo = assetInfo;
              
              // Verify it's actually a prefab
              if (assetInfo.type !== 'cc.Prefab' && !assetInfo.url.endsWith('.prefab')) {
                errors.push(`Asset '${prefabIdentifier}' is not a prefab (type: ${assetInfo.type})`);
              }
            }
          }

          if (prefabUuid && !errors.length) {
            // Open prefab for editing using Cocos Creator API
            await Editor.Message.request('asset-db', 'open-asset', prefabUuid);
            prefabOpened = true;

            // Get prefab info if not already retrieved
            if (!prefabInfo) {
              try {
                prefabInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabUuid);
              } catch (infoError) {
                console.warn('Could not retrieve prefab info after opening:', infoError);
              }
            }
          }

        } catch (openError) {
          errors.push(`Error opening prefab: ${openError instanceof Error ? openError.message : String(openError)}`);
        }

        // Build response message
        let message = '';
        
        if (prefabOpened) {
          message = `Successfully opened prefab for editing:\n`;
          if (prefabInfo) {
            message += `- Prefab name: ${prefabInfo.name}\n`;
            message += `- Prefab URL: ${prefabInfo.url}\n`;
            message += `- Prefab UUID: ${McpServerManager.encodeUuid(prefabInfo.uuid)}\n`;
          }
          
          message += `\nThe prefab is now loaded in the editor and ready for editing.\n`;
          message += `Use 'close-prefab' tool when you're done editing.`;
        } else {
          message = `Failed to open prefab '${prefabIdentifier}'`;
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
        
        let errorMessage = `Error opening prefab: ${error instanceof Error ? error.message : String(error)}`;
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