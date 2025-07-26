import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerOperateAssetTool(server: McpServer): void {
  server.registerTool(
    "operate_asset",
    {
      title: "Operate Asset",
      description: "Copies, moves, or deletes assets by path",
      inputSchema: {
        action: z.enum(["copy", "delete", "move"]),
        originalAssetPath: z.string().describe("Original asset path (e.g., 'db://assets/texture.png')"),
        destinationPath: z.string().describe("Destination path for copy and move operations (required for copy/move)").optional(),
        overwrite: z.boolean().describe("Whether to overwrite if destination exists").optional().default(false),
        rename: z.boolean().describe("Whether to auto-rename if conflict occurs").optional().default(false)
      }
    },
    async ({ action, originalAssetPath, destinationPath, overwrite, rename }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let operationResult: any = null;

        // Validate required parameters
        if ((action === "copy" || action === "move") && !destinationPath) {
          throw new Error(`destinationPath is required for ${action} operation`);
        }

        try {
          // Verify original asset exists
          const originalAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', originalAssetPath);
          if (!originalAssetInfo) {
            errors.push(`Original asset not found at path: ${originalAssetPath}`);
          } else {
            switch (action) {
              case "copy": {
                try {
                  if (!destinationPath) {
                    throw new Error("Destination path is required for copy operation");
                  }
                  const result = await Editor.Message.request('asset-db', 'copy-asset', originalAssetPath, destinationPath, { 
                    overwrite: overwrite, 
                    rename: rename 
                  });

                  if (result) {
                    operationResult = {
                      action: "copy",
                      success: true,
                      originalPath: originalAssetPath,
                      newPath: destinationPath,
                      assetInfo: result
                    };
                  } else {
                    errors.push(`Failed to copy asset from '${originalAssetPath}' to '${destinationPath}'. Unknown error occurred.`);
                  }
                } catch (copyError) {
                  errors.push(`Error copying asset: ${copyError instanceof Error ? copyError.message : String(copyError)}`);
                }
                break;
              }

              case "move": {
                try {
                  if (!destinationPath) {
                    throw new Error("Destination path is required for move operation");
                  }
                  const result = await Editor.Message.request('asset-db', 'move-asset', originalAssetPath, destinationPath, { 
                    overwrite: overwrite, 
                    rename: rename 
                  });

                  if (result) {
                    operationResult = {
                      action: "move",
                      success: true,
                      originalPath: originalAssetPath,
                      newPath: destinationPath,
                      assetInfo: result
                    };
                  } else {
                    errors.push(`Failed to move asset from '${originalAssetPath}' to '${destinationPath}'. Unknown error occurred.`);
                  }
                } catch (moveError) {
                  errors.push(`Error moving asset: ${moveError instanceof Error ? moveError.message : String(moveError)}`);
                }
                break;
              }

              case "delete": {
                try {
                  const originalUuid = originalAssetInfo.uuid;
                  const result = await Editor.Message.request('asset-db', 'delete-asset', originalAssetPath);

                  operationResult = {
                    action: "delete",
                    success: true,
                    deletedPath: originalAssetPath,
                    deletedAssetUuid: McpServerManager.encodeUuid(originalUuid),
                    result: result
                  };
                } catch (deleteError) {
                  errors.push(`Error deleting asset: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`);
                }
                break;
              }
            }
          }
        } catch (assetError) {
          errors.push(`Error accessing asset: ${assetError instanceof Error ? assetError.message : String(assetError)}`);
        }

        // Build response message
        let message = '';
        
        if (operationResult && operationResult.success) {
          message = `Successfully performed '${action}' operation:\n`;
          
          switch (action) {
            case "copy":
              message += `- Copied from: ${operationResult.originalPath}\n`;
              message += `- Copied to: ${operationResult.newPath}\n`;
              if (operationResult.assetInfo.uuid) {
                message += `- New asset UUID: ${McpServerManager.encodeUuid(operationResult.assetInfo.uuid)}\n`;
              }
              if (operationResult.assetInfo.url) {
                message += `- New asset URL: ${operationResult.assetInfo.url}\n`;
              }
              break;
            case "move":
              message += `- Moved from: ${operationResult.originalPath}\n`;
              message += `- Moved to: ${operationResult.newPath}\n`;
              if (operationResult.assetInfo.uuid) {
                message += `- Asset UUID: ${McpServerManager.encodeUuid(operationResult.assetInfo.uuid)}\n`;
              }
              if (operationResult.assetInfo.url) {
                message += `- New asset URL: ${operationResult.assetInfo.url}\n`;
              }
              break;
            case "delete":
              message += `- Deleted asset path: ${operationResult.deletedPath}\n`;
              message += `- Deleted asset UUID: ${operationResult.deletedAssetUuid}\n`;
              break;
          }
        } else {
          message = `Failed to perform '${action}' operation on asset '${originalAssetPath}'`;
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
        
        let errorMessage = `Error performing asset operation: ${error instanceof Error ? error.message : String(error)}`;
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