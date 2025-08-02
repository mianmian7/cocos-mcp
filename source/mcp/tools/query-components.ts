import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpServerManager } from "../server-manager";
import { getComponentInfo } from "../utils";

export function registerQueryComponentsTool(server: McpServer): void {
  server.registerTool(
    "query_components",
    {
      title: "Query Component Properties",
      description: "Discovers component properties for the discovery-first workflow. Returns detailed property information including types, current values, and tooltips for AI agents to learn what properties are available.",
      inputSchema: {
        componentUuids: z.array(z.string()).describe("Array of component UUIDs to query"),
        includeTooltips: z.boolean().default(false).describe("Get property descriptions/tooltips"),
        propertiesFilter: z.enum(["all", "commonly-used", "basic"]).default("all").describe("Filter properties by relevance")
      }
    },
    async (args) => {
      const { componentUuids, includeTooltips, propertiesFilter } = args;
      const results: any[] = [];
      const errors: string[] = [];

      try {
        for (const componentUuid of componentUuids) {
          try {
            const componentInfo = await getComponentInfo(componentUuid, true, includeTooltips);
            
            if (componentInfo.error) {
              errors.push(`Component ${componentUuid}: ${componentInfo.error}`);
              continue;
            }

            const result: any = {
              uuid: componentUuid,
              type: componentInfo.type || "Unknown"
            };

            // Filter and process properties based on the filter setting
            if (componentInfo.properties && Object.keys(componentInfo.properties).length > 0) {
              let propertyPaths = Object.keys(componentInfo.properties);

              if (propertiesFilter === "basic") {
                // Only include very basic properties
                const basicProps = ["position", "rotation", "scale", "enabled", "active", "name"];
                propertyPaths = propertyPaths.filter(prop => 
                  basicProps.some(basic => prop.startsWith(basic))
                );
              } else if (propertiesFilter === "commonly-used") {
                // Exclude internal/advanced properties
                propertyPaths = propertyPaths.filter(prop => 
                  !prop.startsWith("_") && 
                  !prop.includes("__") &&
                  !prop.includes("internal") &&
                  !prop.includes("debug")
                );
              }

              // Build property details
              result.properties = [];
              for (const propertyPath of propertyPaths) {
                const propInfo = componentInfo.properties[propertyPath];
                
                const propertyInfo: any = {
                  path: propertyPath,
                  type: propInfo.type || "Unknown",
                  value: propInfo.value
                };

                // Add tooltip if requested and available
                if (includeTooltips && propInfo.tooltip) {
                  propertyInfo.tooltip = propInfo.tooltip;
                }

                // Add enum values if available
                if (propInfo.enumList && propInfo.enumList.length > 0) {
                  propertyInfo.enumValues = propInfo.enumList;
                }

                result.properties.push(propertyInfo);
              }
            }

            results.push(result);

          } catch (componentError) {
            errors.push(`Error querying component ${componentUuid}: ${componentError instanceof Error ? componentError.message : String(componentError)}`);
          }
        }

        const result = {
          operation: "query-components",
          components: results,
          requestedOptions: {
            includeTooltips,
            propertiesFilter
          },
          successCount: results.length,
          totalRequested: componentUuids.length,
          errors: errors.length > 0 ? errors : undefined
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result)
          }]
        };

      } catch (error) {
        const result = {
          operation: "query-components",
          components: [],
          successCount: 0,
          totalRequested: componentUuids.length,
          errors: [`Global error: ${error instanceof Error ? error.message : String(error)}`]
        };

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
