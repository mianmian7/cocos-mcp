import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";

export function registerOperateNodesTool(server: McpServer): void {
  server.registerTool(
    "operate_nodes",
    {
      title: "Batch Operate Nodes",
      description: "Removes, duplicates, or changes parent of multiple nodes.",
      inputSchema: {
        operation: z.enum(["remove", "duplicate", "set-parent"]),
        nodeUuids: z.array(z.string()),
        parentUuid: z.string().describe("Parent UUID for set-parent (scene root if not set)").optional()
      }
    },
    async ({ operation, nodeUuids, parentUuid }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const results: Array<{ nodeUuid: string; success: boolean; result?: any; error?: string }> = [];
        const globalErrors: string[] = [];

        let decodedParentUuid: string | undefined;
        if (operation == "set-parent") {
          if (parentUuid) {
            decodedParentUuid = McpServerManager.decodeUuid(parentUuid);
            // Verify parent node exists
            try {
              const parentNode = await Editor.Message.request('scene', 'query-node', decodedParentUuid);
              if (!parentNode) {
                throw new Error(`Parent node with UUID ${parentUuid} not found`);
              }
            } catch (parentError) {
              throw new Error(`Failed to verify parent node: ${parentError instanceof Error ? parentError.message : String(parentError)}`);
            }
          } else {
            const parentNode = await Editor.Message.request('scene', 'query-node-tree') as any;
            decodedParentUuid = parentNode.uuid;
          }
        }

        // Process each node
        for (const nodeUuid of nodeUuids) {
          const nodeResult: {
            nodeUuid: string;
            success: boolean;
            result?: any;
            error?: string;
          } = {
            nodeUuid: nodeUuid,
            success: false
          };

          try {
            const decodedUuid = McpServerManager.decodeUuid(nodeUuid);

            // Verify node exists first
            const nodeInfo = await Editor.Message.request('scene', 'query-node', decodedUuid);
            if (!nodeInfo) {
              nodeResult.error = `Node with UUID ${nodeUuid} not found`;
              results.push(nodeResult);
              continue;
            }

            switch (operation) {
              case "remove": {
                await Editor.Message.request('scene', 'remove-node', { uuid: decodedUuid });
                nodeResult.success = true;
                nodeResult.result = "Node removed successfully";
                break;
              }

              case "duplicate": {
                const duplicatedUuids = await Editor.Message.request('scene', 'duplicate-node', decodedUuid);
                if (duplicatedUuids && Array.isArray(duplicatedUuids) && duplicatedUuids.length > 0) {
                  nodeResult.success = true;
                  nodeResult.result = {
                    message: "Node duplicated successfully",
                    newNodeUuids: duplicatedUuids.map((uuid: string) => McpServerManager.encodeUuid(uuid))
                  };
                } else {
                  nodeResult.error = "Failed to duplicate node - no new nodes returned";
                }
                break;
              }

              case "set-parent": {
                await Editor.Message.request('scene', 'set-property', {
                  uuid: decodedUuid,
                  path: 'parent',
                  dump: { value: { uuid: decodedParentUuid }, type: 'cc.Node' }
                } as any);
                nodeResult.success = true;
                nodeResult.result = `Node parent set to ${parentUuid}`;
                break;
              }
            }

          } catch (nodeError) {
            nodeResult.error = `Operation '${operation}' failed: ${nodeError instanceof Error ? nodeError.message : String(nodeError)}`;
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
            message += `failed (${result.error})\n`;
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
        
        let errorMessage = `Error performing node operations: ${error instanceof Error ? error.message : String(error)}`;
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