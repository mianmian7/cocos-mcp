import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerCreateAssetFromTemplateTool(server: McpServer): void {
  server.registerTool(
    "create_asset_from_template",
    {
      title: "Create Asset from Template",
      description: "Creates asset by copying a template to destination folder",
      inputSchema: {
        templateIdentifier: z.string().describe("Template UUID or URL to copy from (creates a folder if not set)").optional(),
        destination: z.string().describe("Destination path (e.g., 'db://assets/newMaterial.mat')"),
        overwrite: z.boolean().describe("Whether to overwrite if destination exists").optional().default(false),
        rename: z.boolean().describe("Whether to auto-rename if conflict occurs").optional().default(true)
      }
    },
    async ({ templateIdentifier, destination, overwrite, rename }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let newAssetUuid: string | null = null;
        let newAssetInfo: any = null;

        if (templateIdentifier) {
          try {
            // Determine if templateIdentifier is UUID or URL
            let templateUrl: string;
            
            if (templateIdentifier.startsWith('db://')) {
              // It's already a URL
              templateUrl = templateIdentifier;
            } else {
              // It's a UUID, need to get the URL
              const decodedUuid = McpServerManager.decodeUuid(templateIdentifier);
              const templateAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', decodedUuid);
              
              if (!templateAssetInfo) {
                errors.push(`Template asset not found for UUID: ${templateIdentifier}`);
              } else {
                templateUrl = templateAssetInfo.url;
              }
            }

            if (templateUrl!) {
              // Verify template exists
              const templateInfo = await Editor.Message.request('asset-db', 'query-asset-info', templateUrl);
              if (!templateInfo) {
                errors.push(`Template asset not found at: ${templateUrl}`);
              } else {

                try {
                  // Copy the template to the new location
                  const result = await Editor.Message.request('asset-db', 'copy-asset', templateUrl, destination, { 
                    overwrite: overwrite,
                    rename: rename
                  });

                  if (result && result.uuid) {
                    newAssetUuid = result.uuid;
                    newAssetInfo = result;
                  } else {
                    // Try to query the asset that should have been created
                    try {
                      const createdAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', destination);
                      if (createdAssetInfo) {
                        newAssetUuid = createdAssetInfo.uuid;
                        newAssetInfo = createdAssetInfo;
                      } else {
                        errors.push(`Asset creation may have succeeded but could not retrieve asset info from ${destination}`);
                      }
                    } catch (queryError) {
                      errors.push(`Asset creation completed but failed to query new asset: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
                    }
                  }
                } catch (copyError) {
                  errors.push(`Error copying template to new asset: ${copyError instanceof Error ? copyError.message : String(copyError)}`);
                }
              }
            }
          } catch (templateError) {
            errors.push(`Error processing template: ${templateError instanceof Error ? templateError.message : String(templateError)}`);
          }
        } else {
          try {
            newAssetInfo = await Editor.Message.request('asset-db', 'create-asset', destination, null, { 
                    overwrite: overwrite,
                    rename: rename
                  });
            newAssetUuid = newAssetInfo.uuid;
          } catch (createError) {
            errors.push(`Error creating new folder at destination: ${createError instanceof Error ? createError.message : String(createError)}`);
          }
        }

        // Build response message
        let message = '';
        
        if (newAssetUuid && newAssetInfo) {
          const encodedUuid = McpServerManager.encodeUuid(newAssetUuid);
          message = `Successfully created asset with UUID ${encodedUuid} and type ${newAssetInfo.type}:\n`;
        } else {
          message = `Failed to create asset from template '${templateIdentifier}'`;
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
        
        let errorMessage = `Error creating asset from template: ${error instanceof Error ? error.message : String(error)}`;
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