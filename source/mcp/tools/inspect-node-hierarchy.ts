import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerInspectNodeHierarchyTool(server: McpServer): void {
  server.registerTool(
    "inspect_node_hierarchy",
    {
      title: "Inspect Node Hierarchy",
      description: "Returns node hierarchy with names, UUIDs, components, and children",
      inputSchema: {
        nodeUuid: z.string().describe("root node UUID (scene root if not set)").optional()
      }
    },
    async ({ nodeUuid }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let hierarchy: any = null;

        try {
          let nodeTree: any = null;
          
          if (nodeUuid) {
            // Decode and query specific node
            nodeUuid = McpServerManager.decodeUuid(nodeUuid);
            nodeTree = await Editor.Message.request('scene', 'query-node-tree', nodeUuid);
            
            if (!nodeTree) {
              errors.push(`Node with UUID ${nodeUuid} not found`);
            }
          } else {
            // Get root scene node
            nodeTree = await Editor.Message.request('scene', 'query-node-tree');
            if (!nodeTree) {
              errors.push("No scene loaded");
            }
          }

          if (nodeTree) {
            // Build hierarchy tree recursively
            const buildHierarchy = async (node: any): Promise<any> => {
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
              } else if (node.components && node.components.length > 0) {
                result.components = node.components.map((component: any) => ({
                  name: component.type || component.name,
                  uuid: McpServerManager.encodeUuid(component.value || component.uuid)
                }));
              }

              // Add children recursively
              if ((node.children && node.children.length > 0) || (node.__children__ && node.__children__.length > 0)) {
                const children = node.children || node.__children__;
                result.children = [];
                
                for (const child of children) {
                  try {
                      result.children.push(await buildHierarchy(child));
                  } catch (childError) {
                    errors.push(`Error querying child node: ${childError instanceof Error ? childError.message : String(childError)}`);
                  }
                }
              }

              return result;
            };

            hierarchy = await buildHierarchy(nodeTree);
          }
        } catch (queryError) {
          errors.push(`Error querying node hierarchy: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
        }

        // Build response message
        let message = '';
        
        if (hierarchy) {
          message = JSON.stringify(hierarchy);
        } else {
          message = 'No node hierarchy available';
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
        
        let errorMessage = `Error retrieving node hierarchy: ${error instanceof Error ? error.message : String(error)}`;
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