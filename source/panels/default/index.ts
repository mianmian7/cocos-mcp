/* eslint-disable vue/one-component-per-file */

import { readFileSync } from 'fs-extra';
import { join } from 'path';
import { createApp, App, defineComponent } from 'vue';

const panelDataMap = new WeakMap<any, App>();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
           
            app.component('McpServerControl', defineComponent({
                data() {
                    const VERSION = '1.0.2';
                    return {
                        VERSION,
                        serverInfo: {
                            isRunning: false,
                            config: {
                                port: 3000,
                                name: 'cocos-mcp-server',
                                version: VERSION,
                                autoStart: false,
                                tools: {}
                            }
                        },
                        config: {
                            port: 3000,
                            name: 'cocos-mcp-server',
                            autoStart: false,
                            tools: {}
                        },
                        isLoading: false,
                        i18n: {
                            mcp_server_control: Editor.I18n.t('cocos-mcp.mcp_server_control'),
                            status_running: Editor.I18n.t('cocos-mcp.status_running'),
                            status_stopped: Editor.I18n.t('cocos-mcp.status_stopped'),
                            port: Editor.I18n.t('cocos-mcp.port'),
                            name: Editor.I18n.t('cocos-mcp.name'),
                            version: Editor.I18n.t('cocos-mcp.version'),
                            auto_start: Editor.I18n.t('cocos-mcp.auto_start'),
                            auto_start_hint: Editor.I18n.t('cocos-mcp.auto_start_hint'),
                            start_server: Editor.I18n.t('cocos-mcp.start_server'),
                            stop_server: Editor.I18n.t('cocos-mcp.stop_server'),
                            starting: Editor.I18n.t('cocos-mcp.starting'),
                            stopping: Editor.I18n.t('cocos-mcp.stopping'),
                            available_tools: Editor.I18n.t('cocos-mcp.available_tools'),
                            core_tools: Editor.I18n.t('cocos-mcp.core_tools'),
                            scene_assets: Editor.I18n.t('cocos-mcp.scene_assets'),
                            discovery: Editor.I18n.t('cocos-mcp.discovery'),
                            generation_project: Editor.I18n.t('cocos-mcp.generation_project'),
                            file_system_tools: Editor.I18n.t('cocos-mcp.file_system_tools'),
                            code_execution_tools: Editor.I18n.t('cocos-mcp.code_execution_tools'),
                            create_nodes: Editor.I18n.t('cocos-mcp.create_nodes'),
                            modify_nodes: Editor.I18n.t('cocos-mcp.modify_nodes'),
                            query_nodes: Editor.I18n.t('cocos-mcp.query_nodes'),
                            query_components: Editor.I18n.t('cocos-mcp.query_components'),
                            modify_components: Editor.I18n.t('cocos-mcp.modify_components'),
                            scene_operations: Editor.I18n.t('cocos-mcp.scene_operations'),
                            prefab_operations: Editor.I18n.t('cocos-mcp.prefab_operations'),
                            asset_operations: Editor.I18n.t('cocos-mcp.asset_operations'),
                            linked_prefab_operations: Editor.I18n.t('cocos-mcp.linked_prefab_operations'),
                            get_component_types: Editor.I18n.t('cocos-mcp.get_component_types'),
                            get_asset_types: Editor.I18n.t('cocos-mcp.get_asset_types'),
                            get_assets_by_type: Editor.I18n.t('cocos-mcp.get_assets_by_type'),
                            generate_image_assets: Editor.I18n.t('cocos-mcp.generate_image_assets'),
                            project_settings: Editor.I18n.t('cocos-mcp.project_settings'),
                            advanced_file_operations: Editor.I18n.t('cocos-mcp.advanced_file_operations'),
                            execute_scene_code: Editor.I18n.t('cocos-mcp.execute_scene_code'),
                            file_operations_warning: Editor.I18n.t('cocos-mcp.file_operations_warning'),
                            code_execution_warning: Editor.I18n.t('cocos-mcp.code_execution_warning'),
                            server_information: Editor.I18n.t('cocos-mcp.server_information'),
                            url: Editor.I18n.t('cocos-mcp.url'),
                            active_tools: Editor.I18n.t('cocos-mcp.active_tools'),
                            copy_config: Editor.I18n.t('cocos-mcp.copy_config')
                        }
                    };
                }, 
                methods: {
                    async startServer() {
                        this.isLoading = true;

                        try {
                            // Create a deep copy to avoid Vue reactivity issues
                            const configData = JSON.parse(JSON.stringify({
                                port: Number(this.config.port) || 3000,
                                name: String(this.config.name) || 'cocos-mcp-server',
                                version: this.VERSION,
                                autoStart: Boolean(this.config.autoStart),
                                tools: this.config.tools
                            }));
                            const result = await Editor.Message.request('cocos-mcp', 'start-mcp-server', configData);
                            if (result && result.success) {
                                await this.refreshServerInfo();
                            } else {
                                console.error(`Failed to start server: ${result ? result.message : 'Unknown error'}`);
                            }
                        } catch (error) {
                            console.error(`Error starting server: ${error}`);
                        } finally {
                            this.isLoading = false;
                        }
                    },
                    
                    async stopServer() {
                        this.isLoading = true;
                        
                        try {
                            const result = await Editor.Message.request('cocos-mcp', 'stop-mcp-server');  
                            if (result && result.success) {
                                await this.refreshServerInfo();
                            } else {
                                console.error(`Failed to stop server: ${result ? result.message : 'Unknown error'}`);
                            }
                        } catch (error) {
                            console.error(`Error stopping server: ${error}`);
                        } finally {
                            this.isLoading = false;
                        }
                    },
                    
                    async saveConfig() {
                        this.isLoading = true;

                        try {
                            const configData = JSON.parse(JSON.stringify({
                                port: Number(this.config.port) || 3000,
                                name: String(this.config.name) || 'cocos-mcp-server',
                                version: this.VERSION,
                                autoStart: Boolean(this.config.autoStart),
                                tools: this.config.tools
                            }));

                            const result = await Editor.Message.request('cocos-mcp', 'update-mcp-server-config', configData);
                            if (result && result.success) {
                                // Configuration saved successfully
                            } else {
                                console.error(`Failed to save config: ${result ? result.message : 'Unknown error'}`);
                            }
                        } catch (error) {
                            console.error(`Error saving config: ${error}`);
                        } finally {
                            this.isLoading = false;
                        }
                    },
                    
                    async refreshServerInfo() {
                        try {
                            const info = await Editor.Message.request('cocos-mcp', 'get-mcp-server-info');
                            // Create deep copies to avoid reactivity issues
                            this.serverInfo = JSON.parse(JSON.stringify({
                                isRunning: info.isRunning,
                                config: {
                                    port: info.config.port,
                                    name: info.config.name,
                                    version: this.VERSION,
                                    autoStart: info.config.autoStart || false,
                                    tools: info.config.tools
                                }
                            }));

                            // Only update local config if server is running to avoid overriding user changes
                            if (info.isRunning && info.config.tools) {
                                this.config = JSON.parse(JSON.stringify({
                                    port: info.config.port,
                                    name: info.config.name,
                                    autoStart: info.config.autoStart || false,
                                    tools: info.config.tools
                                }));
                            } else if (!info.isRunning) {
                                // When server is not running, only update port and name, keep tool config as-is
                                this.config.port = info.config.port;
                                this.config.name = info.config.name;
                                this.config.autoStart = info.config.autoStart || false;
                            }
                        } catch (error) {
                            console.error('Error getting server info:', error);
                        }
                    },
                    
                    getActiveToolsCount() {
                        return Object.values(this.config.tools).filter(Boolean).length;
                    },
                    
                    getTotalToolsCount() {
                        return Object.keys(this.config.tools).length;
                    },
                    
                    // Event handlers for ui-checkbox components
                    onOperateScriptsAndTextChange(event: any): void {
                        const newValue = event.target.value;
                        (this.config.tools as any).operateScriptsAndText = newValue;
                        this.saveConfig();
                    },
                    
                    onExecuteSceneCodeChange(event: any): void {
                        const newValue = event.target.value;
                        (this.config.tools as any).executeSceneCode = newValue;
                        this.saveConfig();
                    },
                    
                    // Generic handler for all tool checkboxes
                    onToolChange(toolName: string, event: any) {
                        const newValue = event.target.value;
                        (this.config.tools as any)[toolName] = newValue;
                        this.saveConfig();
                    },

                    // Handler for auto-start checkbox
                    onAutoStartChange(event: any) {
                        const newValue = event.target.value;
                        this.config.autoStart = newValue;
                        this.saveConfig();
                    },

                    // Copy config methods
                    async copyToClipboard(text: string) {
                        try {
                            await navigator.clipboard.writeText(text);
                        } catch (error) {
                            console.error('Failed to copy:', error);
                        }
                    },

                    copyClaudeCode() {
                        const cmd = `claude mcp add --transport http cocos-creator http://127.0.0.1:${this.config.port}/mcp`;
                        this.copyToClipboard(cmd);
                    },

                    copyCursorVscode() {
                        const config = JSON.stringify({
                            mcpServers: {
                                "cocos-creator": {
                                    url: `http://localhost:${this.config.port}/mcp`
                                }
                            }
                        }, null, 2);
                        this.copyToClipboard(config);
                    }
                },
                
                async mounted() {
                    // Load initial config from server
                    await this.refreshServerInfo();

                    // Initialize local config with server config
                    this.config = {
                        port: this.serverInfo.config.port,
                        name: this.serverInfo.config.name,
                        autoStart: this.serverInfo.config.autoStart || false,
                        tools: { ...this.serverInfo.config.tools }
                    };
                    
                    // Only refresh server status periodically, but don't override config if server is stopped
                    setInterval(async () => {
                        try {
                            const info = await Editor.Message.request('cocos-mcp', 'get-mcp-server-info');
                            // Only update server status, don't override local config changes
                            this.serverInfo.isRunning = info.isRunning;
                            this.serverInfo.config.port = info.config.port;
                            this.serverInfo.config.name = info.config.name;
                            
                            // Only sync tools config if server is actually running
                            if (info.isRunning) {
                                this.serverInfo.config.tools = info.config.tools;
                            }
                        } catch (error) {
                            console.error('Error refreshing server status:', error);
                        }
                    }, 5000);
                },
                
                template: readFileSync(join(__dirname, '../../../static/template/vue/mcp-server-control.html'), 'utf-8'),
            }));
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
