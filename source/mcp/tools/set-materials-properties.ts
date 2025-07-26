import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";
import * as fs from 'fs';
import * as path from 'path';
import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";

export function registerSetMaterialsPropertiesTool(server: McpServer): void {
  server.registerTool(
    "set_materials_properties",
    {
      title: "Batch Set Materials Properties",
      description: "Updates properties of materials: texture, color, effect, etc. Note: Internal materials (db://internal/*) are protected and cannot be modified.",
      inputSchema: {
        materials: z.array(z.object({
          materialUuidOrUrl: z.string().describe("Material UUID or db:// URL. Internal materials (db://internal/*) cannot be modified."),
          effectUuidOrUrl: z.string().optional(),
          mainTexture: z.string().optional().describe("cc.Texture2D type asset"),
          tilingOffset: z.object({ 
            x: z.number().describe("Scale X"), 
            y: z.number().describe("Scale Y"), 
            z: z.number().describe("Offset X"), 
            w: z.number().describe("Offset Y")
          }).optional(),
          mainColor: z.object({ r: z.number(), g: z.number(), b: z.number(), a: z.number() }).optional().describe("cc.Color, values [0..255]"),
          occlusion: z.number().min(0).max(1).optional(),
          roughness: z.number().min(0).max(1).optional(),
          metallic: z.number().min(0).max(1).optional(),
          specularIntensity: z.number().min(0).max(1).optional(),
          emissiveColor: z.object({ r: z.number(), g: z.number(), b: z.number() }).optional().describe("cc.Color, values [0..255]"),
          technique: z.enum(["Opaque", "Transparent"]).optional(),
        }))
      }
    },
    async ({ materials }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const results: Array<{ materialUuid: string; success: boolean; error?: string }> = [];
        const globalErrors: string[] = [];

        // Process each material
        for (let i = 0; i < materials.length; i++) {
          const materialSpec = materials[i];
          const materialResult: any = {
            materialUuid: materialSpec.materialUuidOrUrl,
            success: false,
          }

          try {
            // 0. Check if material is internal (protected from modification)
            const materialUrl = materialSpec.materialUuidOrUrl;
            if (materialUrl.includes("/internal/") || materialUrl.startsWith("db://internal")) {
              throw new Error(`Cannot modify internal material: ${materialUrl}. Internal materials are protected from modification.`);
            }

            // 1. Get material asset info
            const materialAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', materialSpec.materialUuidOrUrl);
            if (!materialAssetInfo) {
              throw new Error(`Material asset not found: ${materialSpec.materialUuidOrUrl}`);
            }

            // Verify it's a material
            if (materialAssetInfo.type !== 'cc.Material') {
              throw new Error(`Asset is not a material (type: ${materialAssetInfo.type})`);
            }

            // 2. Get file property (filesystem path)
            const materialFilePath = materialAssetInfo.file;
            if (!materialFilePath) {
              throw new Error(`Material file path not found in asset info`);
            }

            // 3. Read and parse JSON
            let materialJson: any;
            try {
              const fileContent = fs.readFileSync(materialFilePath, 'utf8');
              materialJson = JSON.parse(fileContent);
            } catch (fileError) {
              throw new Error(`Failed to read/parse material file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
            }

            // 4. Validate and process mainTexture if provided
            let mainTextureUuid: string | null = null;
            if (materialSpec.mainTexture) {
              let textureAssetInfo: AssetInfo | null;
              if (materialSpec.mainTexture.startsWith("db://")) {
                // It's a URL, get asset info to verify type and get UUID
                textureAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', materialSpec.mainTexture);
                if (!textureAssetInfo) {
                  throw new Error(`Texture asset not found: ${materialSpec.mainTexture}`);
                }
              } else {
                // It's a UUID, decode and verify
                try {
                  const decodedUuid = McpServerManager.decodeUuid(materialSpec.mainTexture);
                  textureAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', decodedUuid);
                  if (!textureAssetInfo) {
                    throw new Error(`Texture asset not found for UUID: ${materialSpec.mainTexture}`);
                  }
                } catch (decodeError) {
                  throw new Error(`Failed to decode texture UUID: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`);
                }
                if (textureAssetInfo.type !== 'cc.Texture2D') {
                  for (let subAssetKey in textureAssetInfo.subAssets) {
                    if (textureAssetInfo.subAssets[subAssetKey].type == 'cc.Texture2D') {
                      mainTextureUuid = textureAssetInfo.subAssets[subAssetKey].uuid;
                      break;
                    }
                  }
                  if (!mainTextureUuid) {
                    throw new Error(`Asset is not cc.Texture2D (type: ${textureAssetInfo.type})`);
                  }
                } else {
                  mainTextureUuid = textureAssetInfo.uuid;
                }
              }
            }

            // 5. Determine technique index
            let techIdx = materialJson._techIdx || 0;
            if (materialSpec.technique) {
              techIdx = materialSpec.technique === "Transparent" ? 1 : 0;
              materialJson._techIdx = techIdx;
            }

            // Ensure _defines and _props arrays are properly initialized and maintain 6 elements
            if (!materialJson._defines) {
              materialJson._defines = [{}, {}, {}, {}, {}, {}];
            } else {
              // Ensure we always have exactly 6 elements, preserving existing ones
              while (materialJson._defines.length < 6) {
                materialJson._defines.push({});
              }
            }
            
            if (!materialJson._props) {
              materialJson._props = [{}, {}, {}, {}, {}, {}];
            } else {
              // Ensure we always have exactly 6 elements, preserving existing ones
              while (materialJson._props.length < 6) {
                materialJson._props.push({});
              }
            }

            // Ensure _states maintains its original structure (don't modify, just ensure 6 elements)
            if (materialJson._states && materialJson._states.length < 6) {
              // If _states exists but has fewer than 6 elements, extend it by copying the last element
              const lastState = materialJson._states[materialJson._states.length - 1] || {
                "rasterizerState": {},
                "depthStencilState": {},
                "blendState": { "targets": [{}] }
              };
              while (materialJson._states.length < 6) {
                materialJson._states.push(JSON.parse(JSON.stringify(lastState)));
              }
            }

            // 6. Apply properties to the first pass
            const props = materialJson._props[0];
            const defines = materialJson._defines[0];

            // Apply effect if provided
            if (materialSpec.effectUuidOrUrl) {
              let effectUuid: string;
              let effectAssetInfo: AssetInfo | null;
              if (materialSpec.effectUuidOrUrl.startsWith("db://")) {
                effectAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', materialSpec.effectUuidOrUrl);
              } else {
                effectUuid = McpServerManager.decodeUuid(materialSpec.effectUuidOrUrl);
                effectAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', effectUuid);
              }

              if (!effectAssetInfo) {
                throw new Error(`Effect asset not found`);
              }

              if (effectAssetInfo.type != 'cc.EffectAsset') {
                throw new Error(`Effect asset is not cc.EffectAsset type (type: ${effectAssetInfo.type})`);
              }

              effectUuid = effectAssetInfo.uuid;
              
              materialJson._effectAsset = {
                "__uuid__": effectUuid,
                "__expectedType__": "cc.EffectAsset"
              };
            }

            // Apply mainTexture and set USE_ALBEDO_MAP define
            if (mainTextureUuid) {
              props.mainTexture = {
                "__uuid__": mainTextureUuid,
                "__expectedType__": "cc.Texture2D"
              };
              defines.USE_ALBEDO_MAP = true;
            }

            // Apply other properties
            if (materialSpec.tilingOffset) {
              props.tilingOffset = {
                "__type__": "cc.Vec4",
                "x": materialSpec.tilingOffset.x,
                "y": materialSpec.tilingOffset.y,
                "z": materialSpec.tilingOffset.z,
                "w": materialSpec.tilingOffset.w
              };
            }

            if (materialSpec.mainColor) {
              props.mainColor = {
                "__type__": "cc.Color",
                "r": Math.round(materialSpec.mainColor.r),
                "g": Math.round(materialSpec.mainColor.g),
                "b": Math.round(materialSpec.mainColor.b),
                "a": Math.round(materialSpec.mainColor.a)
              };
            }

            if (materialSpec.occlusion !== undefined) {
              props.occlusion = materialSpec.occlusion;
            }

            if (materialSpec.roughness !== undefined) {
              props.roughness = materialSpec.roughness;
            }

            if (materialSpec.metallic !== undefined) {
              props.metallic = materialSpec.metallic;
            }

            if (materialSpec.specularIntensity !== undefined) {
              props.specularIntensity = materialSpec.specularIntensity;
            }

            if (materialSpec.emissiveColor) {
              props.emissive = {
                "__type__": "cc.Color",
                "r": Math.round(materialSpec.emissiveColor.r),
                "g": Math.round(materialSpec.emissiveColor.g),
                "b": Math.round(materialSpec.emissiveColor.b),
                "a": 255
              };
            }

            // 7. Save the modified JSON back to file
            try {
              fs.writeFileSync(materialFilePath, JSON.stringify(materialJson, null, 2), 'utf8');
              materialResult.success = true;
            } catch (writeError) {
              throw new Error(`Failed to save material file: ${writeError instanceof Error ? writeError.message : String(writeError)}`);
            }

          } catch (setPropertiesError) {
            materialResult.error = `Can't set properties for ${materialSpec.materialUuidOrUrl}: ${setPropertiesError instanceof Error ? setPropertiesError.message : String(setPropertiesError)}`;
            materialResult.success = false;
          }

          results.push(materialResult);
        }

        // Build response message
        const successCount = results.filter(r => r.success).length;
        let message = `Processed ${materials.length} materials: ${successCount} successful, ${materials.length - successCount} failed\n\n`;

        results.forEach((result, index) => {
          message += `Material ${index + 1} (${result.materialUuid}): `;
          if (result.success) {
            message += `✓ success\n`;
          } else {
            message += `✗ failed (${result.error})\n`;
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
        
        let errorMessage = `Error setting material properties: ${error instanceof Error ? error.message : String(error)}`;
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