import { create } from 'domain';
import { get } from 'http';
import { join } from 'path';
module.paths.push(join(Editor.App.path, 'node_modules'));

const logs: Array<string> = new Array<string>();

export function load() {
    console.log = ((log) => {
        return (...args: any[]) => {
            log.apply(console, args);
            logs.push("LOG: " + args.join(','));
        };
    })(console.log);
    console.error = ((error) => {
        return (...args: any[]) => {
            error.apply(console, args);
            logs.push("ERROR: " + args.join(','));
        };
    })(console.error);
    console.warn = ((warn) => {
        return (...args: any[]) => {
            warn.apply(console, args);
            logs.push("WARN: " + args.join(','));
        };
    })(console.warn);
};
export function unload() {};
export const methods: Record<string, (...args: any[]) => any> = {
    queryComponentTypes() {
        const cc = (globalThis as any)['cc'];
        const js = cc.js;
        const Component = cc.Component;
        const result: string[] = [];
        Object.keys(js._registeredClassNames).forEach((key) => {
            if (js.isChildClassOf(js.getClassByName(key), Component) &&
                !key.includes('Component')) {
                result.push(key);
            }
        });
        return result;
    },

    queryAssetTypes() {
        const cc = (globalThis as any)['cc'];
        const js = cc.js;
        const Asset = cc.Asset;
        const result: string[] = [];
        Object.keys(js._registeredClassNames).forEach((key) => {
            if (js.isChildClassOf(js.getClassByName(key), Asset)) {
                result.push(key);
            }
        });
        return result;
    },

    isCorrectComponentType(type: string): boolean {
        const cc = (globalThis as any)['cc'];
        const js = cc.js;
        const Component = cc.Component;
        return js.isChildClassOf(js.getClassByName(type), Component);
    },

    isCorrectAssetType(type: string): boolean {
        const cc = (globalThis as any)['cc'];
        const js = cc.js;
        const Asset = cc.Asset;
        return js.isChildClassOf(js.getClassByName(type), Asset);
    },

    async createNodeFromPrefab(name: string, prefabUuid: string, parentNodeUuid: string | null): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const cc = (globalThis as any)['cc'];
                const Node = cc.Node;
                cc.assetManager.loadAny({uuid: prefabUuid}, null, (err : any, prefab : any) => {
                    const newNode = cc.instantiate(prefab);
                    newNode.name = name;
                    if(parentNodeUuid != null) {
                        let parentNode = cc.director.getScene().getChildByUuid(parentNodeUuid);
                        if(parentNode) {
                            parentNode.addChild(newNode);
                        } else {
                            cc.director.getScene().addChild(newNode);
                        }
                    } else {
                        cc.director.getScene().addChild(newNode);
                    }
                    resolve(newNode.uuid);
                });
            } catch(error) {
                reject(error);
            }
        });
    },

    startCaptureSceneLogs() {
        logs.length = 0;
    },

    getCapturedSceneLogs() {
        return logs;
    },

    async createPrefabFromNode(nodeUuid: string, path: string) {
        try {
            const cce = (globalThis as any)['cce'];
            
            if (!cce || !cce.Prefab || !cce.Prefab.createPrefabAssetFromNode) {
                throw new Error('CCE API not found');
            }

            return await cce.Prefab.createPrefabAssetFromNode(nodeUuid, path);
        } catch (error) {
            console.error('Error creating prefab from node:', error);
            return null;
        }
    },

    async applyPrefabByNode(nodeUuid: string) {
        try {
            const cce = (globalThis as any)['cce'];
            
            if (!cce || !cce.Prefab || !cce.Prefab.applyPrefab) {
                throw new Error('CCE API not found');
            }

            await cce.Prefab.applyPrefab(nodeUuid);
        } catch (error) {
            console.error('Error applying prefab:', error);
            return null;
        }
    },

    async unlinkPrefabByNode(nodeUuid: string, recursive: boolean) {
        try {
            const cce = (globalThis as any)['cce'];
            
            if (!cce || !cce.Prefab || !cce.Prefab.unWrapPrefabInstance) {
                throw new Error('CCE API not found');
            }

            return await cce.Prefab.unWrapPrefabInstance(nodeUuid, recursive);
        } catch (error) {
            console.error('Error applying prefab:', error);
            return false;
        }
    }
};