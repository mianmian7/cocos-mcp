import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';
import { McpServerManager } from "../server-manager";
import { ExecuteSceneScriptMethodOptions } from "@cocos/creator-types/editor/packages/scene/@types/public";
import { ComponentDescription, getComponentInfo, tryToAddComponent } from "../utils";

export function registerCreateNodesTool(server: McpServer): void {
  const nodeTypesMap : { [key: string]: { url: string, requireCanvas: boolean} } = {
    "3D/Capsule": { url: "db://internal/default_prefab/3d/Capsule.prefab", requireCanvas: false },
    "3D/Cone": { url: "db://internal/default_prefab/3d/Cone.prefab", requireCanvas: false },
    "3D/Cube": { url: "db://internal/default_prefab/3d/Cube.prefab", requireCanvas: false },
    "3D/Cylinder": { url: "db://internal/default_prefab/3d/Cylinder.prefab", requireCanvas: false },
    "3D/Plane": { url: "db://internal/default_prefab/3d/Plane.prefab", requireCanvas: false },
    "3D/Quad": { url: "db://internal/default_prefab/3d/Quad.prefab", requireCanvas: false },
    "3D/Sphere": { url: "db://internal/default_prefab/3d/Sphere.prefab", requireCanvas: false },
    "3D/Torus": { url: "db://internal/default_prefab/3d/Torus.prefab", requireCanvas: false },
    "SpriteRenderer": { url: "db://internal/default_prefab/ui/SpriteRenderer.prefab", requireCanvas: false },
    "2D/Graphics": { url: "db://internal/default_prefab/ui/Graphics.prefab", requireCanvas: true },
    "2D/Label": { url: "db://internal/default_prefab/ui/Label.prefab", requireCanvas: true },
    "2D/Mask": { url: "db://internal/default_prefab/ui/Mask.prefab", requireCanvas: true },
    "2D/ParticleSystem2D": { url: "db://internal/default_prefab/ui/ParticleSystem2D.prefab", requireCanvas: true },
    "2D/Sprite": { url: "db://internal/default_prefab/ui/Sprite.prefab", requireCanvas: true },
    "2D/SpriteSplash": { url: "db://internal/default_prefab/ui/SpriteSplash.prefab", requireCanvas: true },
    "2D/TiledMap": { url: "db://internal/default_prefab/ui/TiledMap.prefab", requireCanvas: true },
    "UI/Button": { url: "db://internal/default_prefab/ui/Button.prefab", requireCanvas: true },
    "UI/Canvas": { url: "db://internal/default_prefab/ui/Canvas.prefab", requireCanvas: false },
    "UI/EditBox": { url: "db://internal/default_prefab/ui/EditBox.prefab", requireCanvas: true },
    "UI/Layout": { url: "db://internal/default_prefab/ui/Layout.prefab", requireCanvas: true },
    "UI/PageView": { url: "db://internal/default_prefab/ui/pageView.prefab", requireCanvas: true },
    "UI/ProgressBar": { url: "db://internal/default_prefab/ui/ProgressBar.prefab", requireCanvas: true },
    "UI/RichText": { url: "db://internal/default_prefab/ui/RichText.prefab", requireCanvas: true },
    "UI/ScrollView": { url: "db://internal/default_prefab/ui/ScrollView.prefab", requireCanvas: true },
    "UI/Slider": { url: "db://internal/default_prefab/ui/Slider.prefab", requireCanvas: true },
    "UI/Toggle": { url: "db://internal/default_prefab/ui/Toggle.prefab", requireCanvas: true },
    "UI/ToggleGroup": { url: "db://internal/default_prefab/ui/ToggleContainer.prefab", requireCanvas: true },
    "UI/VideoPlayer": { url: "db://internal/default_prefab/ui/VideoPlayer.prefab", requireCanvas: true },
    "UI/WebView": { url: "db://internal/default_prefab/ui/WebView.prefab", requireCanvas: true },
    "UI/Widget": { url: "db://internal/default_prefab/ui/Widget.prefab", requireCanvas: true },
    "Light/Directional": { url: "db://internal/default_prefab/light/Directional Light.prefab", requireCanvas: false },
    "Light/Sphere": { url: "db://internal/default_prefab/light/Sphere Light.prefab", requireCanvas: false },
    "Light/Spot": { url: "db://internal/default_prefab/light/Spot Light.prefab", requireCanvas: false },
    "Light/LightProbeGroup": { url: "db://internal/default_prefab/light/Light Probe Group.prefab", requireCanvas: false },
    "Light/ReflectionProbe": { url: "db://internal/default_prefab/light/Reflection Probe.prefab", requireCanvas: false },
    "ParticleSystem": { url: "db://internal/default_prefab/effects/Particle System.prefab", requireCanvas: false },
    "Camera": { url: "db://internal/default_prefab/Camera.prefab", requireCanvas: false },
    "Terrain": { url: "db://internal/default_prefab/Terrain.prefab", requireCanvas: false }
  };

  const mobilityTypes: { [key: string] : number } = {
    "Static": 0,
    "Stationary": 1,
    "Movable": 2
  }

  server.registerTool(
    "create_nodes",
    {
      title: "Batch Create Nodes",
      description: "Creates nodes using type, name, components, and transform. Supports prefabs",
      inputSchema: {
        parentUuid: z.string().describe("parent node UUID (scene root if not set)").optional(),
        nodes: z.array(z.object({
          nodeType: z.enum([
            "3D/Capsule", "3D/Cone", "3D/Cube", "3D/Cylinder", "3D/Plane", "3D/Quad", "3D/Sphere", "3D/Torus",
            "2D/SpriteRenderer", "2D/Graphics", "2D/Label", "2D/Mask", "2D/ParticleSystem2D", "2D/Sprite", "2D/SpriteSplash", "2D/TiledMap",
            "UI/Button", "UI/Canvas", "UI/EditBox", "UI/Layout", "UI/PageView", "UI/ProgressBar", "UI/RichText", "UI/ScrollView", "UI/Slider", "UI/Toggle", "UI/ToggleGroup", "UI/VideoPlayer", "UI/WebView", "UI/Widget",
            "Light/Directional", "Light/Sphere", "Light/Spot", "Light/LightProbeGroup", "Light/ReflectionProbe",
            "ParticleSystem", "Camera", "Terrain", "Empty", "Prefab"
          ]).describe("One of default types or Empty/Prefab"),
          prefabUuid: z.string().describe("prefab UUID (if nodeType is Prefab)").optional(),
          componentTypes: z.array(z.string()).describe("Array of component types to add").min(0),
          name: z.string(),
          position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
          eulerAngles: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
          scale: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
          enabled: z.boolean().describe("Enabled in hierarchy").optional().default(true),
          mobility: z.enum(["Static", "Stationary", "Movable"]).optional(),
          layer: z.number().int().describe("Bitmask of layer, use only if aware of layer list").optional()
        }))
      }
    },
    async ({ parentUuid, nodes }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        if (parentUuid) {
          parentUuid = McpServerManager.decodeUuid(parentUuid);
        }

        const createdNodes: Array<{ name: string; uuid: string; components: Array<ComponentDescription> }> = [];
        const errors: string[] = [];

        // Get root scene node if parent not specified
        if (!parentUuid) {
          const hierarchy = await Editor.Message.request('scene', 'query-node-tree') as any;
          if (hierarchy && hierarchy.uuid) {
            parentUuid = hierarchy.uuid;
          } else {
            throw new Error("No scene loaded and no parent specified");
          }
        }

        // Process each node
        for (let i = 0; i < nodes.length; i++) {
          const nodeSpec = nodes[i];
          try {
            let createdNodeUuid: string | null = null;

            let prefabUuid: string | null = "";
            
            if (nodeSpec.nodeType == "Prefab") {
              if (!nodeSpec.prefabUuid) {
                errors.push(`Node ${i + 1} (${nodeSpec.name}): prefabUuid is required for Prefab node type`);
                continue;
              } else {
                prefabUuid = McpServerManager.decodeUuid(nodeSpec.prefabUuid);
              }
            } else {
              if (nodeSpec.nodeType != "Empty") {
                let assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', nodeTypesMap[nodeSpec.nodeType].url);
                if (!assetInfo) {
                  errors.push(`Node ${i + 1} (${nodeSpec.name}): can't find template prefab for ${nodeSpec.nodeType}!`);
                  continue;
                }
                prefabUuid = assetInfo.uuid;
              }
            }

            // Check if it's an internal prefab (should be unlinked)
            let unlinkPrefab = true;
            if (nodeSpec.nodeType == "Prefab")
            {
              unlinkPrefab = false;
              try {
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabUuid);
                if (assetInfo && assetInfo.url && assetInfo.url.startsWith('db://internal')) {
                  unlinkPrefab = true;
                }
              } catch (error) {
                console.warn('Failed to query asset meta for unlinkPrefab logic:', error);
              }
            }

            if (unlinkPrefab) {
              // Create unlinked node from prefab
              createdNodeUuid = await Editor.Message.request('scene', 'create-node', {
                parent: parentUuid,
                assetUuid: prefabUuid,
                name: nodeSpec.name,
                unlinkPrefab: true,
                canvasRequired: nodeTypesMap[nodeSpec.nodeType]?.requireCanvas || false
              }) as unknown as string;
            } else {
              // Use native scene code to create linked prefab
              createdNodeUuid = await Editor.Message.request('scene', 'execute-scene-script', { 
                name: packageJSON.name, 
                method: 'createNodeFromPrefab', 
                args: [nodeSpec.name, prefabUuid, parentUuid] 
              });
            }

            if (!createdNodeUuid) {
              errors.push(`Node ${i + 1} (${nodeSpec.name}): Failed to create node`);
              continue;
            }

            // Set node properties
            const nodeProperties: Array<{ path: string; value: any; type: string }> = [];

            if (nodeSpec.position) {
              nodeProperties.push({ path: 'position', value: nodeSpec.position, type: 'cc.Vec3' });
            }
            if (nodeSpec.eulerAngles) {
              nodeProperties.push({ path: 'eulerAngles', value: nodeSpec.eulerAngles, type: 'cc.Vec3' });
            }
            if (nodeSpec.scale) {
              nodeProperties.push({ path: 'scale', value: nodeSpec.scale, type: 'cc.Vec3' });
            }
            if (nodeSpec.enabled !== undefined) {
              nodeProperties.push({ path: 'active', value: nodeSpec.enabled, type: 'Boolean' });
            }
            if (nodeSpec.mobility !== undefined) {
              nodeProperties.push({ path: 'mobility', value: mobilityTypes[nodeSpec.mobility], type: 'Enum' });
            }
            if (nodeSpec.layer !== undefined) {
              nodeProperties.push({ path: 'layer', value: nodeSpec.layer, type: 'Number' });
            }

            // Apply properties
            for (const prop of nodeProperties) {
              try {
                await Editor.Message.request('scene', 'set-property', {
                  uuid: createdNodeUuid,
                  path: prop.path,
                  dump: { value: prop.value, type: prop.type }
                } as any);
              } catch (propError) {
                errors.push(`Node ${i + 1} (${nodeSpec.name}): Failed to set ${prop.path} - ${propError instanceof Error ? propError.message : String(propError)}`);
              }
            }

            const components: Array<ComponentDescription> = [];

            if (nodeSpec.componentTypes.length > 0) {
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

              // Add each component to this node
              for (const componentType of nodeSpec.componentTypes) {
                try {
                  // Validate component type
                  const isCorrectComponentType: boolean = 
                    await Editor.Message.request('scene', 'execute-scene-script', 
                      { name: packageJSON.name, method: 'isCorrectComponentType', args: [componentType] });

                  if (!isCorrectComponentType) {
                    errors.push(`Node ${i + 1} (${createdNodeUuid}): Component type '${componentType}' is not valid`);
                    continue;
                  }

                  const newComponent = await tryToAddComponent(createdNodeUuid, componentType);
                  if (newComponent.error) {
                    errors.push(`Node ${i + 1} (${createdNodeUuid}): Error adding component: ${newComponent.error}`);
                  } else {
                    components.push(newComponent);
                  }
                } catch (addComponentError) {
                  errors.push(`Node ${i + 1} (${createdNodeUuid}): Error adding component: ${addComponentError instanceof Error ? addComponentError.message : String(addComponentError)}`);
                }
              }
            }

            // Get node info to extract components
            const nodeInfo = await Editor.Message.request('scene', 'query-node', createdNodeUuid);
            
            if (nodeInfo && nodeInfo.__comps__) {
              for (const comp of nodeInfo.__comps__) {
                if (comp.value && typeof comp.value === 'object' && 'uuid' in comp.value) {
                  const compValue = comp.value as any;
                  if (!components.some(c => c.uuid == compValue.uuid.value)) {
                    const compInfo = await getComponentInfo(compValue.uuid.value, true, false);
                    if (compInfo.error) {
                      errors.push(`Node ${i + 1} (${createdNodeUuid}): Error getting component info: ${compInfo.error}`);
                    } else {
                      components.push(compInfo);
                    }
                  }
                }
              }
            }

            createdNodes.push({
              name: nodeSpec.name,
              uuid: McpServerManager.encodeUuid(createdNodeUuid),
              components: components
            });

          } catch (nodeError) {
            errors.push(`Node ${i + 1} (${nodeSpec.name}): ${nodeError instanceof Error ? nodeError.message : String(nodeError)}`);
          }
        }

        const result: any = {
          createdNodes: createdNodes
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
          content: [{ type: "text", text: JSON.stringify(result) }]
        };

      } catch (error) {
        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        
        const result: any = { error: `Error creating nodes: ${error instanceof Error ? error.message : String(error)}` };
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