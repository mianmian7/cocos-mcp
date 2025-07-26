import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";
import { ExecuteSceneScriptMethodOptions } from "@cocos/creator-types/editor/packages/scene/@types/public";
import { ComponentDescription, tryToAddComponent } from "../utils";

export function registerAddComponentsToNodesTool(server: McpServer): void {
  server.registerTool(
    "add_components_to_nodes",
    {
      title: "Batch Add Components to Nodes",
      description: "Adds components to multiple nodes.",
      inputSchema: {
        nodes: z.array(z.object({
          nodeUuid: z.string(),
          componentTypes: z.array(z.string()).describe("Array of component types to add")
        }))
      }
    },
    async ({ nodes }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const result: any = {};
        const results: { [nodeUuid: string]: Array<ComponentDescription> } = {};
        const errors: string[] = [];
        let availableComponentTypes: string[] = [];

        // Get available component types for validation (will be included in result if any components fail)
        try {
          const options: ExecuteSceneScriptMethodOptions = {
            name: packageJSON.name,
            method: 'queryComponentTypes',
            args: []
          };
          availableComponentTypes = await Editor.Message.request('scene', 'execute-scene-script', options);
        } catch (queryError) {
          errors.push(`Warning: Could not retrieve available component types: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
        }

        // Process each node
        for (let i = 0; i < nodes.length; i++) {
          const nodeSpec = nodes[i];
          const nodeComponents: Array<ComponentDescription> = [];

          try {
            const decodedNodeUuid = McpServerManager.decodeUuid(nodeSpec.nodeUuid);

            // Verify node exists
            const nodeInfo = await Editor.Message.request('scene', 'query-node', decodedNodeUuid);
            if (!nodeInfo) {
              errors.push(`Node ${i + 1} (${nodeSpec.nodeUuid}): Node not found`);
              results[nodeSpec.nodeUuid] = [];
              continue;
            }

            // Add each component to this node
            for (const componentType of nodeSpec.componentTypes) {
              try {
                // Validate component type
                const isCorrectComponentType: boolean = 
                  await Editor.Message.request('scene', 'execute-scene-script', 
                    { name: packageJSON.name, method: 'isCorrectComponentType', args: [componentType] });

                if (!isCorrectComponentType) {
                  throw new Error(`Component type '${componentType}' is not valid`);
                  continue;
                }

                const newComponent = await tryToAddComponent(nodeSpec.nodeUuid, componentType);
                if (newComponent.error) {
                  throw new Error(newComponent.error);
                } else {
                  nodeComponents.push(newComponent);
                }
              } catch (addComponentError) {
                errors.push(`Node ${i + 1} (${nodeSpec.nodeUuid}): Error adding component: ${addComponentError instanceof Error ? addComponentError.message : String(addComponentError)}. Available component types: ${availableComponentTypes.join(", ")}`);
              }
            }

            results[nodeSpec.nodeUuid] = nodeComponents;

          } catch (nodeError) {
            errors.push(`Node ${i + 1} (${nodeSpec.nodeUuid}): Error processing node - ${nodeError instanceof Error ? nodeError.message : String(nodeError)}`);
            results[nodeSpec.nodeUuid] = [];
          }
        }

        result.results = results;
        if (errors.length > 0) {
          result.errors = errors;
        }

        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        if (capturedLogs.length > 0) {
          result.capturedLogs = capturedLogs;
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

        const result: any = {
          error: `Error adding components to nodes: ${error instanceof Error ? error.message : String(error)}`,
        }

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