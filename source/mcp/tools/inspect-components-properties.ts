import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { ComponentDescription, getComponentInfo } from "../utils";

export function registerInspectComponentsPropertiesTool(server: McpServer): void {
  server.registerTool(
    "inspect_components_properties",
    {
      title: "Inspect Components Properties",
      description: "Returns properties of components: names, paths, types, values, enums.",
      inputSchema: {
        componentUuids: z.array(z.string()).min(1),
        includeTooltips: z.boolean().optional().default(false).describe("Whether to include detailed descriptions if available")
      }
    },
    async ({ componentUuids, includeTooltips }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      const result: any = {};
      try {
        const errors: string[] = [];
        const descriptions: Array<ComponentDescription> = [];

        for (let componentUuid of componentUuids) {
          const componentDescription: ComponentDescription = await getComponentInfo(componentUuid, true, includeTooltips);
          if (componentDescription.error) {
            errors.push(componentDescription.error);
          } else {
            descriptions.push(componentDescription);
          }
        }

        if (descriptions.length > 0) {
          result.descriprions = descriptions;
        }
        if (errors.length > 0) {
          result.errors = errors;
        }

        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        if (capturedLogs.length > 0) {
          result.logs = capturedLogs;
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
        
        result.errors = [`Error inspecting component properties: ${error instanceof Error ? error.message : String(error)}`];
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