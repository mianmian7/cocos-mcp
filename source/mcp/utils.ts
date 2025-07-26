import path from "path";
import { McpServerManager } from "./server-manager";
import { array } from "zod";

export type ComponentDescription = {
    uuid?: string,
    type?: string,
    properties?: {[path: string]: { type: string, value?: any, tooltip?: string, enumList?: string[] }},
    arrays?: {[path: string]: { type: string, tooltip?: string }},
    help_document?: string
    error?: string,
}

export async function getComponentInfo(component: string | object, includeProperties: boolean, includeTooltips: boolean): Promise<ComponentDescription> {
    // Build component description
    const componentDescription: ComponentDescription = { };
    
    try {
        let componentInfo: any = {};

        if (typeof component == 'string') {
            const decodedUuid = McpServerManager.decodeUuid(component);
            componentInfo = await Editor.Message.request('scene', 'query-component', decodedUuid) as any;
            if (!componentInfo) {
                throw new Error(`Component with UUID "${decodedUuid}" not found`);
            }
        } else {
            componentInfo = component;
        }
        
        if (!componentInfo) {
            throw new Error("Component not found or invalid");
        } else {
            componentDescription.type = componentInfo.type;

            if (includeProperties) {
                // Extract component properties with enhanced information
                const extractPropertiesRecursive = (obj: any, basePath: string = ''): 
                    { properties: { [path: string]: any }, arrays: { [path: string]: any } } => {
                    const properties: { [path: string]: any } = {};
                    const arrays: { [path: string]: any } = {};

                    Object.keys(obj).forEach(key => {
                    if (key.startsWith('_')) return; // Skip private properties

                    const currentPath = basePath ? `${basePath}.${key}` : key;
                    const propertyData = obj[key];

                    if (propertyData && typeof propertyData === 'object' && propertyData.hasOwnProperty('value')) {
                        // This is a property with metadata
                        const propertyInfo: any = {
                            type: propertyData.type || 'Unknown',
                            value: propertyData.value
                        };

                        // Add tooltip if available
                        if (propertyData.tooltip && includeTooltips) {
                            try {
                                propertyInfo.tooltip = Editor.I18n.t(propertyData.tooltip.replace('i18n:', ''));
                            } catch (i18nError) {
                                propertyInfo.tooltip = propertyData.tooltip;
                            }
                        }

                        // Add enum options if this is an enum type
                        if (propertyData.type === 'Enum' && propertyData.enumList) {
                            propertyInfo.enumList = propertyData.enumList;
                        }

                        if (propertyData.isArray) {
                            arrays[currentPath] = {
                                type: propertyInfo.type,
                                tooltip: propertyInfo.tooltip
                            }
                        }

                        const simpleTypes = ['String', 'Number', 'Boolean', 'cc.ValueType', 'cc.Object'];

                        // Handle nested objects
                        if (propertyData.value && 
                            ((typeof propertyData.value === 'object' && 
                                !simpleTypes.includes(propertyData.type) && 
                                !(propertyData.extends && propertyData.extends.some((ext: string) => simpleTypes.includes(ext)))) 
                            || Array.isArray(propertyData.value))) {
                            const extractionResult = extractPropertiesRecursive(propertyData.value, currentPath);
                            Object.assign(properties, extractionResult.properties);
                            Object.assign(arrays, extractionResult.arrays);
                        } else {
                            properties[currentPath] = propertyInfo;
                        }
                    }
                    });

                    return { properties, arrays };
                };

                const extractionResult = extractPropertiesRecursive(componentInfo.value || componentInfo);
                componentDescription.properties = extractionResult.properties;
                componentDescription.arrays = extractionResult.arrays;
            }
        }
    } catch (queryError) {
        componentDescription.error = `Error querying component: ${queryError instanceof Error ? queryError.message : String(queryError)}`;
    }

    return componentDescription;
}

export async function tryToAddComponent(nodeUuid: string, componentType: string): Promise<ComponentDescription> {
    try {
        await Editor.Message.request('scene', 'create-component', {
            uuid: nodeUuid,
            component: componentType
        } as any);

        // Get updated node info to find the new component
        const updatedNodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
        if (updatedNodeInfo && updatedNodeInfo.__comps__ && updatedNodeInfo.__comps__.length > 0) {
            const lastAddedComponent = updatedNodeInfo.__comps__[updatedNodeInfo.__comps__.length - 1] as any;
            return await getComponentInfo(lastAddedComponent, true, false); // Fetch full component details including properties
        } else {
            return { uuid: '', error: `Tried to add '${componentType}' but could not retrieve component info` };
        }

    } catch (componentError) {
        return { uuid: '', error: `Failed to add component '${componentType}' - ${componentError instanceof Error ? componentError.message : String(componentError)}` };
    }
}