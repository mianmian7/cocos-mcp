import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerSetNodesPropertiesTool(server: McpServer): void {
  server.registerTool(
    "set_nodes_properties",
    {
      title: "Batch Set Nodes Properties",
      description: "Updates properties of nodes: name, transform, mobility, visibility, layer",
      inputSchema: {
        nodes: z.array(z.object({
          nodeUuid: z.string(),
          name: z.string().optional(),
          position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
          eulerAngles: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
          scale: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
          enabled: z.boolean().describe("Enabled in hierarchy").optional(),
          mobility: z.enum(["Static", "Stationary", "Movable"]).optional(),
          layer: z.number().int().describe("Possible values can be aquired and manipulated through operate-project-settings tool").optional()
        }))
      }
    },
    async ({ nodes }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const results: Array<{ nodeUuid: string; success: boolean; properties: string[]; errors: string[] }> = [];
        const globalErrors: string[] = [];

        // Process each node
        for (let i = 0; i < nodes.length; i++) {
          const nodeSpec = nodes[i];
          const nodeResult = {
            nodeUuid: nodeSpec.nodeUuid,
            success: true,
            properties: [] as string[],
            errors: [] as string[]
          };

          try {
            const decodedUuid = McpServerManager.decodeUuid(nodeSpec.nodeUuid);

            // Verify node exists
            const nodeInfo = await Editor.Message.request('scene', 'query-node', decodedUuid) as any;
            if (!nodeInfo) {
              nodeResult.success = false;
              nodeResult.errors.push(`Node with UUID ${nodeSpec.nodeUuid} not found`);
              results.push(nodeResult);
              continue;
            }

            // Prepare properties to set
            const propertiesToSet: Array<{ path: string; value: any; type: string }> = [];

            if (nodeSpec.name !== undefined) {
              propertiesToSet.push({ path: 'name', value: nodeSpec.name, type: 'String' });
            }
            if (nodeSpec.position !== undefined) {
              propertiesToSet.push({ path: 'position', value: nodeSpec.position, type: 'cc.Vec3' });
            }
            if (nodeSpec.eulerAngles !== undefined) {
              propertiesToSet.push({ path: 'eulerAngles', value: nodeSpec.eulerAngles, type: 'cc.Vec3' });
            }
            if (nodeSpec.scale !== undefined) {
              propertiesToSet.push({ path: 'scale', value: nodeSpec.scale, type: 'cc.Vec3' });
            }
            if (nodeSpec.enabled !== undefined) {
              propertiesToSet.push({ path: 'active', value: nodeSpec.enabled, type: 'Boolean' });
            }
            if (nodeSpec.mobility !== undefined) {
              // Convert string to enum value
              const mobilityValues = { "Static": 0, "Stationary": 1, "Movable": 2 };
              propertiesToSet.push({ path: 'mobility', value: mobilityValues[nodeSpec.mobility], type: 'Number' });
            }
            if (nodeSpec.layer !== undefined) {
              propertiesToSet.push({ path: 'layer', value: nodeSpec.layer, type: 'Number' });
            }

            // Apply each property
            for (const prop of propertiesToSet) {
              try {
                // Set the property
                await Editor.Message.request('scene', 'set-property', {
                  uuid: decodedUuid,
                  path: prop.path,
                  dump: { value: prop.value, type: prop.type }
                } as any);

                nodeResult.properties.push(prop.path);
              } catch (propError) {
                nodeResult.success = false;
                nodeResult.errors.push(`Failed to set '${prop.path}': ${propError instanceof Error ? propError.message : String(propError)}`);
              }
            }

          } catch (nodeError) {
            nodeResult.success = false;
            nodeResult.errors.push(`Error processing node: ${nodeError instanceof Error ? nodeError.message : String(nodeError)}`);
          }

          results.push(nodeResult);
        }

        // Build response message
        const successCount = results.filter(r => r.success).length;
        let message = "";

        results.forEach((result, index) => {
          message += `Node ${index + 1} (UUID: ${result.nodeUuid}): `;
          if (result.success) {
            message += `success\n`;
          } else {
            message += `failed (${result.errors.join(', ')})\n`;
          }
        });

        if (globalErrors.length > 0) {
          message += `\n\nGlobal Errors:\n${globalErrors.join(',')}`;
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
        
        let errorMessage = `Error setting node properties: ${error instanceof Error ? error.message : String(error)}`;
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