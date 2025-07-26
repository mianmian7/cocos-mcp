import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import { McpServerManager } from "../server-manager";

export function registerGenerateImageAssetTool(server: McpServer): void {
  server.registerTool(
    "generate_image_asset",
    {
      title: "Generate Image Asset",
      description: "Generates image from SVG or emoji and creates an asset of selected type",
      inputSchema: {
        svgContent: z.string().describe("SVG markup content or single emoji symbol"),
        destination: z.string().describe("Path where to create the new asset (e.g., db://assets/icon.png)"),
        assetType: z.enum(["raw", "texture", "normal-map", "sprite-frame", "texture-cube"]).describe("Type of asset to create (e.g., 'texture' for materials, 'sprite-frame' for sprites)").default("sprite-frame"),
        overwrite: z.boolean().describe("Whether to overwrite if target exists").optional().default(false),
        rename: z.boolean().describe("Whether to auto-rename if conflict occurs").optional().default(false)
      }
    },
    async ({ svgContent, destination, assetType, overwrite, rename }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let assetCreationResult: AssetInfo | null = null;

        try {
          // Generate image using panel's Canvas API directly
          const imageBuffer = await Editor.Message.request(packageJSON.name, 'generate-image-from-svg', svgContent);

          if (!imageBuffer) {
            throw new Error('Failed to generate image from SVG content');
          }

          // Import modules
          const fs = await import('fs');
          const path_module = await import('path');
          const os = await import('os');
          
          // Ensure the path ends with .png
          let pngPath = destination;
          if (!pngPath.endsWith('.png')) {
            pngPath = pngPath.replace(/\.[^.]*$/, '.png');
          }
          
          // Create temporary file path
          const tempDir = os.tmpdir();
          const tempFileName = `temp_image_${Date.now()}.png`;
          const tempFilePath = path_module.join(tempDir, tempFileName);
          
          // Write buffer to temporary file
          await fs.promises.writeFile(tempFilePath, Buffer.from(imageBuffer.data));
          
          // Import the temporary file as asset
          let importResult = await Editor.Message.request('asset-db', 'import-asset', tempFilePath, pngPath, {
            overwrite: overwrite,
            rename: rename
          });
          
          // Clean up temporary file
          try {
            await fs.promises.unlink(tempFilePath);
          } catch (cleanupError) {
            console.warn('Failed to cleanup temporary file:', cleanupError);
          }
          
          if (!importResult) {
            throw new Error('Failed to import generated image as asset');
          }

          // Apply the specified asset type to meta
          try {
            const modifiedResult = await modifyAssetMeta(importResult.url, assetType);
            if (modifiedResult) {
              assetCreationResult = modifiedResult;
            } else {
              assetCreationResult = importResult;
              errors.push(`Asset created but failed to apply type '${assetType}' to meta`);
            }
          } catch (metaError) {
            assetCreationResult = importResult;
            errors.push(`Asset created but failed to modify meta: ${metaError instanceof Error ? metaError.message : String(metaError)}`);
          }

        } catch (generationError) {
          errors.push(`Error generating image asset: ${generationError instanceof Error ? generationError.message : String(generationError)}`);
        }

        // Build response message
        let message = '';
        
        if (assetCreationResult) {
          message = `Successfully generated image asset with UUID ${assetCreationResult.uuid}\n`;

          // Add sub-assets info if available
          if (assetCreationResult.subAssets && Object.keys(assetCreationResult.subAssets).length > 0) {
            message += `\nSub-Assets:\n`;
            Object.keys(assetCreationResult.subAssets).forEach(key => {
              const subAsset = assetCreationResult!.subAssets[key];
              message += `- ${subAsset.type} (UUID: ${McpServerManager.encodeUuid(subAsset.uuid)})\n`;
            });
          }
        } else {
          message = `Failed to generate image asset at '${destination}'`;
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
        
        let errorMessage = `Error generating image asset: ${error instanceof Error ? error.message : String(error)}`;
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

/**
 * Modify asset meta file to set the specified type
 */
async function modifyAssetMeta(assetUrl: string, assetType: string): Promise<AssetInfo | null> {
  try {
    // Get the meta file info
    const metaInfo = await Editor.Message.request('asset-db', 'query-asset-meta', assetUrl);
    
    if (!metaInfo) {
      throw new Error('Could not find meta file for asset');
    }

    // Apply the asset type to meta
    switch (assetType) {
      case "raw":
        metaInfo.userData.type = "raw";
        break;
      case "texture":
        metaInfo.userData.type = "texture";
        break;
      case "normal-map":
        metaInfo.userData.type = "normal map";
        break;
      case "sprite-frame":
        metaInfo.userData.type = "sprite-frame";
        break;
      case "texture-cube":
        metaInfo.userData.type = "texture cube";
        break;
      default:
        throw new Error(`Unsupported asset type: ${assetType}`);
    }

    // Save the modified meta content
    await Editor.Message.request('asset-db', 'save-asset-meta', assetUrl, JSON.stringify(metaInfo));
    
    console.log(`Modified meta file for ${assetUrl} to ${assetType} type`);

    // Refresh the asset to apply changes
    await Editor.Message.request('asset-db', 'refresh-asset', assetUrl);
    
    // Return updated asset info
    return await Editor.Message.request('asset-db', 'query-asset-info', assetUrl);
  } catch (error) {
    console.warn(`Failed to modify meta file for ${assetType}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}