import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerGetAssetsByTypeTool(server: McpServer): void {
  server.registerTool(
    "get_assets_by_type",
    {
      title: "Get Assets By Type",
      description: "Returns assets for a given asset type",
      inputSchema: {
        ccType: z.string().describe("Asset ccType to search for (e.g., 'cc.Prefab', 'cc.Material', 'cc.Texture2D')")
      }
    },
    async ({ ccType }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let assets: Array<{ name: string; url: string; uuid: string }> = [];

        try {
          // Query for assets of the specified type
          const assetInfos = await Editor.Message.request('asset-db', 'query-assets', {
            ccType: ccType
          });

          if (assetInfos && Array.isArray(assetInfos)) {
            assets = assetInfos
              .filter((assetInfo: any) => assetInfo && assetInfo.url)
              .map((assetInfo: any) => ({
                name: assetInfo.name || 'Unknown',
                url: assetInfo.url,
                uuid: McpServerManager.encodeUuid(assetInfo.uuid),
                isTemplate: assetInfo.url.startsWith('db://internal/')
              }))
              .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name for better UX
          }

          // If no results found, provide helpful message
          if (assets.length === 0) {
            errors.push(`No templates found for asset type '${ccType}' in db://internal/** directories`);
          }

        } catch (queryError) {
          errors.push(`Error querying templates for asset type '${ccType}': ${queryError instanceof Error ? queryError.message : String(queryError)}`);
        }

        // Build response message
        let result: any = {};
        
        if (assets.length > 0) {
          result.assets = assets;
        } else {
          result.errors = [ `No templates found for asset type '${ccType}'. Tip: Use 'get-available-asset-types' tool to see all available asset types.` ];
        }

        if (errors.length > 0) {
          if (result.errors) {
            result.errors.push(...errors);
          }
        }

        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        if (capturedLogs.length > 0) {
          result.logs = capturedLogs;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result)
          }]
        };

      } catch (error) {
        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        
        let result: any = { error: `Error retrieving templates for asset type '${ccType}': ${error instanceof Error ? error.message : String(error)}` };
        if (capturedLogs.length > 0) {
          result.logs = capturedLogs;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result)
          }]
        };
      }
    }
  );
}