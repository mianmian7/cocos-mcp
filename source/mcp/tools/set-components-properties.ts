import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";
import { ComponentDescription, getComponentInfo } from "../utils";

export function registerSetComponentsPropertiesTool(server: McpServer): void {
  server.registerTool(
    "set_components_properties",
    {
      title: "Set Components Properties",
      description: "Sets properties on components using path, type, and value",
      inputSchema: {
        components: z.array(z.object({
          componentUuid: z.string(),
          properties: z.array(z.object({
            propertyPath: z.string().describe("Property path (e.g., 'position', 'sharedMaterials.0')"),
            propertyType: z.string().describe("Property type (e.g., 'cc.Vec3', 'String', 'Number')"),
            propertyValue: z.unknown().describe("Property value to set. If setting an array, make sure the property is array by inspect_components_properties")
          })).min(1)
        })).min(1)
      }
    },
    async ({ components }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const results: Array<{ 
          componentUuid: string; 
          success: boolean; 
          propertiesSet: string[]; 
          errors: string[];
          componentProperties?: any;
        }> = [];
        const globalErrors: string[] = [];

        // Process each component
        for (let i = 0; i < components.length; i++) {
          const componentSpec = components[i];
          const componentResult: {
            componentUuid: string;
            success: boolean;
            propertiesSet: string[];
            errors: string[];
            unsuccessfulComponentInfo?: ComponentDescription;
          } = {
            componentUuid: componentSpec.componentUuid,
            success: true,
            propertiesSet: [] as string[],
            errors: [] as string[]
          };

          try {
            const decodedUuid = McpServerManager.decodeUuid(componentSpec.componentUuid);

            // Verify component exists
            const componentInfo = await getComponentInfo(decodedUuid, true, false);
            if (componentInfo.error || !componentInfo.properties) {
              componentResult.success = false;
              componentResult.errors.push(componentInfo.error || `Can't fetch component properties for UUID: ${decodedUuid}`);
              results.push(componentResult);
              continue;
            }

            // Get available properties for validation and potential error reporting
            const availableProperties = Object.keys(componentInfo.properties);
            availableProperties.push(...Object.keys(componentInfo.arrays || {}));

            const targetNodeUuid = componentInfo.properties.node.value.uuid;
            if (!targetNodeUuid) {
              throw new Error(`Component ${decodedUuid} info doen't contains associated node property`);
            }

            const targetNode = await Editor.Message.request('scene', 'query-node', targetNodeUuid);
            if (!targetNode) {
              throw new Error(`Can't find node associated with component ${decodedUuid}`);
            }
            const componentIndex = targetNode.__comps__.findIndex(comp => (comp as any).value.uuid.value == decodedUuid);
            if (componentIndex < 0) {
              throw new Error(`Can't find component ${decodedUuid} in associated node's component list`);
            }

            // Process each property
            for (const propSpec of componentSpec.properties) {
              try {
                let { propertyPath, propertyType, propertyValue } = propSpec;

                // Check if the property path exists (for top-level properties)
                if (!availableProperties.some(p => p.startsWith(propertyPath))) {
                  componentResult.success = false;
                  componentResult.errors.push(`Property '${propertyPath}' does not exist on component.`);
                  componentResult.unsuccessfulComponentInfo = componentInfo;
                  continue;
                }

                const isComponent: boolean = await Editor.Message.request('scene', 'execute-scene-script', 
                      { name: packageJSON.name, method: 'isCorrectComponentType', args: [propertyType] });
                    const isAsset: boolean = await Editor.Message.request('scene', 'execute-scene-script',
                      { name: packageJSON.name, method: 'isCorrectAssetType', args: [propertyType] });
                    const isNode: boolean = propertyType === "cc.Node";
                
                const prerprocessProperty = async (rawProperty: any): Promise<any> => {
                  try {
                    let result: any = {};

                    if (isComponent || isAsset || isNode) {
                      if (typeof rawProperty === 'string') {
                        if (rawProperty.startsWith("db://")) {
                          const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', rawProperty);
                          if (!assetInfo) {
                            throw new Error(`Can't find asset with URL: ${rawProperty}`);
                          }
                          result = { uuid: assetInfo.uuid };
                        } else {
                          result = { uuid: McpServerManager.decodeUuid(rawProperty) };
                        }
                      } else if (rawProperty && typeof rawProperty === 'object' && rawProperty.hasOwnProperty('uuid')) {
                        rawProperty.uuid = McpServerManager.decodeUuid(rawProperty.uuid);
                        result = rawProperty;
                      } else {
                        result = rawProperty;
                      }

                      if (isComponent) {
                        const component = await Editor.Message.request('scene', 'query-component', result.uuid);
                        if (!component || component.type !== propertyType) {
                          throw new Error(`Component with UUID "${result.uuid}" and type "${propertyType}" not found`);
                        }
                      }
                      if (isAsset) {
                        const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', result.uuid);
                        if (!assetInfo || assetInfo.type !== propertyType) {
                          throw new Error(`Asset with UUID "${result.uuid}" and type "${propertyType}" not found`);
                        }
                      }
                      if (isNode) {
                        const node = await Editor.Message.request('scene', 'query-node', result.uuid);
                        if (!node) {
                          throw new Error(`Node with UUID "${result.uuid}" not found`);
                        }
                      }

                      return result;
                    }

                    return rawProperty;
                  } catch (typeCheckError) {
                    // Continue with original value if type checking fails
                    console.warn('Type checking failed:', typeCheckError);
                  }
                }

                if (typeof propertyValue === 'string') {
                  let parsedFromJson: any = null;
                  try {
                    parsedFromJson = JSON.parse(propertyValue);
                  } catch (error) {
                    parsedFromJson = null;
                  }
                  
                  if (parsedFromJson && Array.isArray(parsedFromJson)) {
                    propertyValue = parsedFromJson;
                  }
                }

                let processedValue: any;
                if (Array.isArray(propertyValue)) {
                  processedValue = [];
                  for (let value of propertyValue) {
                    processedValue.push({
                      type: propertyType,
                      value: await prerprocessProperty(value)
                    })
                  }
                } else {
                  processedValue = await prerprocessProperty(propertyValue);
                }

                // Set the property
                await Editor.Message.request('scene', 'set-property', {
                  uuid: targetNodeUuid,
                  path: `__comps__.${componentIndex}.${propertyPath}`,
                  dump: {
                    value: processedValue,
                    type: propertyType
                  }
                } as any);

                componentResult.propertiesSet.push(propertyPath);

              } catch (propError) {
                componentResult.success = false;
                componentResult.errors.push(`Failed to set property '${propSpec.propertyPath}': ${propError instanceof Error ? propError.message : String(propError)}`);
              }
            }

          } catch (componentError) {
            componentResult.success = false;
            componentResult.errors.push(`Error processing component: ${componentError instanceof Error ? componentError.message : String(componentError)}`);
          }

          results.push(componentResult);
        }

        const result: any = {
          results: results,
        };

        if (globalErrors.length > 0) {
          result.globalErrors = globalErrors;
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
        
        const result: any = { error: `Error setting component properties: ${error instanceof Error ? error.message : String(error)}` };
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