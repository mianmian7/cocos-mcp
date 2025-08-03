import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";
import { getComponentInfo, setProperties, PropertySetSpec } from "../utils";

export function registerOperateCurrentSceneTool(server: McpServer): void {
  server.registerTool(
    "operate_current_scene",
    {
      title: "Operations with currently opened scene",
      description: "Scene operations: open, save, inspect, get/set properties",
      inputSchema: {
        operation: z.enum(["open", "save", "inspect-hierarchy", "get-properties", "set-properties"]),
        sceneToOpenUrlOrUuid: z.string().describe("UUID or URL to open (for 'open' operation)").optional(),
        includeTooltips: z.boolean().describe("Include property tooltips (for 'get-properties' operation)").default(false),
        properties: z.array(z.object({
          propertyPath: z.string().describe("Property path (e.g., 'scene.ambientSky.skyColor')"),
          propertyType: z.string().describe("Property type (e.g., 'cc.Color', 'String', 'Number')"),
          propertyValue: z.unknown().describe("Property value to set")
        })).describe("Properties to set (for 'set-properties' operation)").default([])
      }
    },
    async ({ operation, sceneToOpenUrlOrUuid, includeTooltips, properties }) => {
      try {
        switch (operation) {
          case "open": {
            if (!sceneToOpenUrlOrUuid) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({ success: false, error: "sceneToOpenUrlOrUuid is required for 'open' operation" })
                }]
              };
            }

            let sceneInfo: any = null;
            let sceneUuid: string | undefined;

            if (sceneToOpenUrlOrUuid.startsWith('db://')) {
              // It's a URL, get the UUID
              const queryResult = await Editor.Message.request('asset-db', 'query-uuid', sceneToOpenUrlOrUuid);
              if (!queryResult) {
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify({ success: false, error: `Scene asset not found at URL: ${sceneToOpenUrlOrUuid}` })
                  }]
                };
              }
              sceneUuid = queryResult;
            } else {
              // It's a UUID
              sceneUuid = McpServerManager.decodeUuid(sceneToOpenUrlOrUuid);
              // Verify the UUID exists
              const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', sceneUuid);
              if (!assetInfo) {
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify({ success: false, error: `Scene asset not found for UUID: ${sceneToOpenUrlOrUuid}` })
                  }]
                };
              }
              sceneInfo = assetInfo;
            }

            await Editor.Message.request('scene', 'open-scene', sceneUuid);
            if (!sceneInfo) {
              try {
                sceneInfo = await Editor.Message.request('asset-db', 'query-asset-info', sceneUuid);
              } catch {}
            }

            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  success: true,
                  url: sceneInfo?.url || null,
                  uuid: sceneInfo?.uuid ? McpServerManager.encodeUuid(sceneInfo.uuid) : null
                })
              }]
            };
          }

          case "save": {
            await Editor.Message.request('scene', 'save-scene');
            return {
              content: [{
                type: "text",
                text: JSON.stringify({ success: true })
              }]
            };
          }

          case "inspect-hierarchy": {
            const nodeTree = await Editor.Message.request('scene', 'query-node-tree');
            if (!nodeTree) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({ success: false, error: "No scene loaded" })
                }]
              };
            }

            // Build hierarchy tree recursively
            const buildHierarchy = (node: any): any => {
              const result: any = {
                name: node.name?.value || node.name || "Unnamed Node",
                uuid: McpServerManager.encodeUuid(node.uuid?.value || node.uuid),
              };

              // Add components
              if (node.__comps__ && node.__comps__.length > 0) {
                result.components = node.__comps__.map((component: any) => ({
                  name: component.value.name.value,
                  uuid: McpServerManager.encodeUuid(component.value.uuid.value)
                }));
              }

              // Add children recursively
              if ((node.children && node.children.length > 0) || (node.__children__ && node.__children__.length > 0)) {
                const children = node.children || node.__children__;
                result.children = children.map((child: any) => buildHierarchy(child));
              }

              return result;
            };

            const hierarchy = buildHierarchy(nodeTree);
            return {
              content: [{
                type: "text",
                text: JSON.stringify({ success: true, hierarchy })
              }]
            };
          }

          case "get-properties": {
            // Get root scene node
            const nodeTree = await Editor.Message.request('scene', 'query-node-tree') as any;
            if (!nodeTree) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({ success: false, error: "No scene loaded" })
                }]
              };
            }

            const rootNodeUuid = nodeTree.uuid;
            const rootNodeInfo = await Editor.Message.request('scene', 'query-node', rootNodeUuid) as any;
            
            if (!rootNodeInfo || !rootNodeInfo._globals) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({ success: false, error: "Scene globals not found" })
                }]
              };
            }

            // Get component info for _globals
            const globalsInfo = await getComponentInfo(rootNodeInfo._globals, true, includeTooltips);
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  success: true,
                  properties: globalsInfo.properties || {},
                  arrays: globalsInfo.arrays || {},
                  error: globalsInfo.error
                })
              }]
            };
          }

          case "set-properties": {
            if (properties.length === 0) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({ success: false, error: "properties array is required for 'set-properties' operation" })
                }]
              };
            }

            // Get root scene node
            const nodeTree = await Editor.Message.request('scene', 'query-node-tree') as any;
            if (!nodeTree) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({ success: false, error: "No scene loaded" })
                }]
              };
            }

            const rootNodeUuid = nodeTree.uuid;

            // Use shared utility to set properties
            const propertySpecs: PropertySetSpec[] = properties.map(prop => ({
              propertyPath: prop.propertyPath,
              propertyType: prop.propertyType,
              propertyValue: prop.propertyValue
            }));

            const results = await setProperties(rootNodeUuid, "_globals", propertySpecs);
            const successCount = results.filter(r => r.success).length;

            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  success: successCount === properties.length,
                  successCount,
                  totalCount: properties.length,
                  results
                })
              }]
            };
          }

          default:
            return {
              content: [{
                type: "text",
                text: JSON.stringify({ success: false, error: "Unknown operation" })
              }]
            };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error)
            })
          }]
        };
      }
    }
  );
}