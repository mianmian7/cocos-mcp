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
        async 'generate-image-from-svg'(svgContent: string) {
            try {
                // Call the local method to generate the image
                return await this.generateImageFromSVG(svgContent);
            } catch (error) {
                console.error('Panel: Error generating image from SVG:', error);
                throw error;
            }
        },
        
        /**
         * Generate PNG image from SVG content using Canvas API
         * This method should be called from the MCP server tool
         */
        async generateImageFromSVG(svgContent: string): Promise<Buffer> {
            return new Promise((resolve, reject) => {
                try {
                    // Create a new image element
                    const img = new Image();
                    
                    img.onload = () => {
                        try {
                            // Create canvas with appropriate size
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            if (!ctx) {
                                reject(new Error('Failed to get 2D context from canvas'));
                                return;
                            }
                            
                            // Set canvas size (default 512x512, but use image size if available)
                            canvas.width = img.naturalWidth || 512;
                            canvas.height = img.naturalHeight || 512;
                            
                            // Draw the image on canvas
                            ctx.drawImage(img, 0, 0);
                            
                            // Convert canvas to PNG blob
                            canvas.toBlob((blob) => {
                                if (!blob) {
                                    reject(new Error('Failed to convert canvas to blob'));
                                    return;
                                }
                                
                                // Convert blob to buffer
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const arrayBuffer = reader.result as ArrayBuffer;
                                    const buffer = Buffer.from(arrayBuffer);
                                    resolve(buffer);
                                };
                                reader.onerror = () => {
                                    reject(new Error('Failed to read blob as array buffer'));
                                };
                                reader.readAsArrayBuffer(blob);
                            }, 'image/png');
                            
                        } catch (error) {
                            reject(new Error(`Canvas operation failed: ${error}`));
                        }
                    };
                    
                    img.onerror = () => {
                        reject(new Error('Failed to load SVG image'));
                    };
                    
                    // Create data URL from SVG content
                    let svgDataUrl: string;
                    if (svgContent.startsWith('data:')) {
                        // Already a data URL
                        svgDataUrl = svgContent;
                    } else if (svgContent.startsWith('<svg')) {
                        // Raw SVG content - convert to data URL
                        // Encode SVG content for data URL
                        const encodedSvg = encodeURIComponent(svgContent);
                        svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
                    } else {
                        // Assume it's emoji or text content - create simple SVG
                        const simpleSvg = this.createSvgFromText(svgContent);
                        const encodedSvg = encodeURIComponent(simpleSvg);
                        svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
                    }
                    
                    // Load the SVG
                    img.src = svgDataUrl;
                    
                } catch (error) {
                    reject(new Error(`SVG processing failed: ${error}`));
                }
            });
        },
        
        /**
         * Create a simple SVG from text content (especially useful for emojis)
         */
        createSvgFromText(text: string): string {
            return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <text x="256" y="400" text-anchor="middle" font-size="400" font-family="system-ui, -apple-system, sans-serif">${text}</text>
            </svg>`;
        },
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
           
            app.component('McpServerControl', defineComponent({
                data() {
                    const VERSION = '1.0.0';
                    return {
                        VERSION,
                        serverInfo: {
                            isRunning: false,
                            config: { 
                                port: 3000, 
                                name: 'cocos-mcp-server', 
                                version: VERSION 
                            }
                        },
                        config: {
                            port: 3000,
                            name: 'cocos-mcp-server'
                        },
                        isLoading: false
                    };
                }, 
                methods: {
                    async startServer() {
                        this.isLoading = true;
                        
                        try {
                            // Create a plain object to avoid Vue reactivity issues
                            const configData = {
                                port: Number(this.config.port) || 3000,
                                name: String(this.config.name) || 'cocos-mcp-server',
                                version: this.VERSION
                            };
                            console.log('Sending config data:', configData);
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
                    
                    async refreshServerInfo() {
                        try {
                            const info = await Editor.Message.request('cocos-mcp', 'get-mcp-server-info');
                            // Create plain objects to avoid reactivity issues
                            this.serverInfo = {
                                isRunning: info.isRunning,
                                config: {
                                    port: info.config.port,
                                    name: info.config.name,
                                    version: this.VERSION
                                }
                            };
                            this.config = {
                                port: info.config.port,
                                name: info.config.name
                            };
                        } catch (error) {
                            console.error('Error getting server info:', error);
                        }
                    }
                },
                
                async mounted() {
                    await this.refreshServerInfo();
                    // Refresh server status every 5 seconds
                    setInterval(async () => {
                        await this.refreshServerInfo();
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
