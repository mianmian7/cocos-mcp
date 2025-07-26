import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerCreatePrefabFromNodeTool(server: McpServer): void {
  server.registerTool(
    "create_prefab_from_node",
    {
      title: "Create Prefab from Node",
      description: "Creates prefab asset from an existing node",
      inputSchema: {
        nodeUuid: z.string(),
        assetPath: z.string().describe("Target asset path for the new prefab (e.g., 'db://assets/MyPrefab.prefab')"),
        removeOriginal: z.boolean().describe("Whether to remove the original node after creating prefab")
      }
    },
    async ({ nodeUuid, assetPath, removeOriginal }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let prefabUuid: string | null = null;
        let linkedNodeUuid: string | null = null;

        try {
          const decodedNodeUuid = McpServerManager.decodeUuid(nodeUuid);

          // Verify node exists
          const nodeInfo = await Editor.Message.request('scene', 'query-node', decodedNodeUuid);
          if (!nodeInfo) {
            errors.push(`Node with UUID ${nodeUuid} not found`);
          } else {
            // Validate asset path format
            if (!assetPath.startsWith('db://')) {
              errors.push("Asset path must start with 'db://' (e.g., 'db://assets/MyPrefab.prefab')");
            } else if (!assetPath.endsWith('.prefab')) {
              errors.push("Asset path must end with '.prefab'");
            } else {
              // Create prefab from node
              try {
                const result = await Editor.Message.request('scene', 'create-prefab', decodedNodeUuid, assetPath);
                
                if (result && result.uuid) {
                  prefabUuid = result.uuid;
                } else if (result && typeof result === 'string') {
                  // Sometimes the result is just the UUID string
                  prefabUuid = result;
                } else {
                  // Query the asset to get its UUID
                  try {
                    const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', assetPath);
                    if (assetInfo && assetInfo.uuid) {
                      prefabUuid = assetInfo.uuid;
                    } else {
                      errors.push("Prefab creation may have succeeded but couldn't retrieve prefab UUID");
                    }
                  } catch (queryError) {
                    errors.push(`Prefab creation completed but failed to query prefab info: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
                  }
                }

                // Find node with linked prefab which now has new UUID
                if (prefabUuid) {
                  // Query the scene to find nodes with this prefab
                  const sceneNodes = await Editor.Message.request('scene', 'query-node-tree') as any;
                  if (sceneNodes) {
                    // Recursively search for the node with the prefab UUID
                    const findNodeWithPrefab = (nodes: any[]): string | null => {
                      for (const node of nodes) {
                        if (node.prefab?.assetUuid === prefabUuid) {
                          return node.uuid;
                        }
                        if (node.children) {
                          const found = findNodeWithPrefab(node.children);
                          if (found) {
                            return found;
                          }
                        }
                      }
                      return null;
                    }
                    linkedNodeUuid = findNodeWithPrefab(sceneNodes.children);
                  }
                }

                // Optionally remove the original node
                if (linkedNodeUuid && removeOriginal) {
                  try {
                    await Editor.Message.request('scene', 'remove-node', { uuid: linkedNodeUuid });
                  } catch (removeError) {
                    errors.push(`Failed to remove original node after prefab creation: ${removeError instanceof Error ? removeError.message : String(removeError)}`);
                  }
                }
              } catch (createError) {
                errors.push(`Error creating prefab: ${createError instanceof Error ? createError.message : String(createError)}`);
              }
            }
          }
        } catch (nodeError) {
          errors.push(`Error verifying node: ${nodeError instanceof Error ? nodeError.message : String(nodeError)}`);
        }

        // Build response message
        let message = '';
        
        if (prefabUuid) {
          const encodedUuid = McpServerManager.encodeUuid(prefabUuid);
          message = `Successfully created prefab from node '${nodeUuid}': with UUID ${encodedUuid}\n`;
        } else {
          message = `Failed to create prefab from node '${nodeUuid}' at path '${assetPath}'`;
        }

        if (linkedNodeUuid) {
          message += `\nOriginal node UUID has changed to: ${McpServerManager.encodeUuid(linkedNodeUuid)}`;
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
        
        let errorMessage = `Error creating prefab from node: ${error instanceof Error ? error.message : String(error)}`;
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