import { readFileSync } from 'fs-extra';
import { join } from 'path';
import { createApp, App, defineComponent } from 'vue';

const panelDataMap = new WeakMap<any, App>();

/**
 * AI Image Generation Configuration Panel
 */
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('AI Config panel showed'); },
        hide() { console.log('AI Config panel hided'); },
    },
    template: readFileSync(join(__dirname, '../../../static/template/ai-config/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/ai-config/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
           
            app.component('AiConfigPanel', defineComponent({
                data() {
                    return {
                        config: {
                            imageGeneration: {
                                providers: [] as any[],
                                defaultProvider: '',
                                globalSettings: {
                                    timeout: 30000,
                                    retries: 3,
                                    quality: 'high'
                                }
                            }
                        },
                        isLoading: false,
                        notification: {
                            show: false,
                            type: 'info',
                            message: ''
                        },
                        testResults: new Map(),
                        newProvider: {
                            id: '',
                            name: '',
                            type: 'stable-diffusion',
                            baseUrl: '',
                            apiKey: '',
                            models: [] as any[]
                        },
                        newModel: {
                            id: '',
                            name: '',
                            type: 'text2img',
                            providerId: ''
                        },
                        editingProvider: null as any,
                        editingModel: null as any,
                        showProviderDialog: false,
                        showModelDialog: false,
                        showImportDialog: false,
                        i18n: {
                            ai_image_config: Editor.I18n.t('cocos-mcp.ai_image_config'),
                            refresh: Editor.I18n.t('cocos-mcp.refresh'),
                            export: Editor.I18n.t('cocos-mcp.export'),
                            import: Editor.I18n.t('cocos-mcp.import'),
                            reset: Editor.I18n.t('cocos-mcp.reset'),
                            loading: Editor.I18n.t('cocos-mcp.loading'),
                            providers: Editor.I18n.t('cocos-mcp.providers'),
                            add_provider: Editor.I18n.t('cocos-mcp.add_provider'),
                            no_providers: Editor.I18n.t('cocos-mcp.no_providers'),
                            test: Editor.I18n.t('cocos-mcp.test'),
                            edit: Editor.I18n.t('cocos-mcp.edit'),
                            delete: Editor.I18n.t('cocos-mcp.delete'),
                            type: Editor.I18n.t('cocos-mcp.type'),
                            url: Editor.I18n.t('cocos-mcp.url'),
                            not_configured: Editor.I18n.t('cocos-mcp.not_configured'),
                            models: Editor.I18n.t('cocos-mcp.models'),
                            enabled: Editor.I18n.t('cocos-mcp.enabled'),
                            total: Editor.I18n.t('cocos-mcp.total'),
                            connection_successful: Editor.I18n.t('cocos-mcp.connection_successful'),
                            connection_failed: Editor.I18n.t('cocos-mcp.connection_failed'),
                            error: Editor.I18n.t('cocos-mcp.error'),
                            debug_information: Editor.I18n.t('cocos-mcp.debug_information'),
                            fetch_models: Editor.I18n.t('cocos-mcp.fetch_models'),
                            enable_all: Editor.I18n.t('cocos-mcp.enable_all'),
                            disable_all: Editor.I18n.t('cocos-mcp.disable_all'),
                            no_models: Editor.I18n.t('cocos-mcp.no_models'),
                            fetch_models_hint: Editor.I18n.t('cocos-mcp.fetch_models_hint'),
                            configure_url_hint: Editor.I18n.t('cocos-mcp.configure_url_hint'),
                            global_settings: Editor.I18n.t('cocos-mcp.global_settings'),
                            default_provider: Editor.I18n.t('cocos-mcp.default_provider'),
                            select_provider: Editor.I18n.t('cocos-mcp.select_provider'),
                            request_timeout: Editor.I18n.t('cocos-mcp.request_timeout'),
                            max_retries: Editor.I18n.t('cocos-mcp.max_retries'),
                            default_quality: Editor.I18n.t('cocos-mcp.default_quality'),
                            quality_low: Editor.I18n.t('cocos-mcp.quality_low'),
                            quality_medium: Editor.I18n.t('cocos-mcp.quality_medium'),
                            quality_high: Editor.I18n.t('cocos-mcp.quality_high'),
                            quality_ultra: Editor.I18n.t('cocos-mcp.quality_ultra'),
                            save_global_settings: Editor.I18n.t('cocos-mcp.save_global_settings'),
                            edit_provider: Editor.I18n.t('cocos-mcp.edit_provider'),
                            add_provider_title: Editor.I18n.t('cocos-mcp.add_provider_title'),
                            provider_id: Editor.I18n.t('cocos-mcp.provider_id'),
                            provider_name: Editor.I18n.t('cocos-mcp.provider_name'),
                            provider_type: Editor.I18n.t('cocos-mcp.provider_type'),
                            base_url: Editor.I18n.t('cocos-mcp.base_url'),
                            api_key: Editor.I18n.t('cocos-mcp.api_key'),
                            cancel: Editor.I18n.t('cocos-mcp.cancel'),
                            update_provider: Editor.I18n.t('cocos-mcp.update_provider'),
                            stable_diffusion: Editor.I18n.t('cocos-mcp.stable_diffusion'),
                            automatic1111: Editor.I18n.t('cocos-mcp.automatic1111'),
                            dall_e: Editor.I18n.t('cocos-mcp.dall_e'),
                            custom_provider: Editor.I18n.t('cocos-mcp.custom_provider'),
                            edit_model: Editor.I18n.t('cocos-mcp.edit_model'),
                            add_model_title: Editor.I18n.t('cocos-mcp.add_model_title'),
                            model_id: Editor.I18n.t('cocos-mcp.model_id'),
                            model_name: Editor.I18n.t('cocos-mcp.model_name'),
                            model_provider: Editor.I18n.t('cocos-mcp.model_provider'),
                            model_type: Editor.I18n.t('cocos-mcp.model_type'),
                            text_to_image: Editor.I18n.t('cocos-mcp.text_to_image'),
                            image_to_image: Editor.I18n.t('cocos-mcp.image_to_image'),
                            inpainting: Editor.I18n.t('cocos-mcp.inpainting'),
                            outpainting: Editor.I18n.t('cocos-mcp.outpainting'),
                            update_model: Editor.I18n.t('cocos-mcp.update_model'),
                            add_model: Editor.I18n.t('cocos-mcp.add_model'),
                            config_saved: Editor.I18n.t('cocos-mcp.config_saved'),
                            config_save_failed: Editor.I18n.t('cocos-mcp.config_save_failed'),
                            config_load_failed: Editor.I18n.t('cocos-mcp.config_load_failed'),
                            config_exported: Editor.I18n.t('cocos-mcp.config_exported'),
                            config_export_failed: Editor.I18n.t('cocos-mcp.config_export_failed'),
                            config_imported: Editor.I18n.t('cocos-mcp.config_imported'),
                            config_import_failed: Editor.I18n.t('cocos-mcp.config_import_failed'),
                            config_reset: Editor.I18n.t('cocos-mcp.config_reset'),
                            config_reset_failed: Editor.I18n.t('cocos-mcp.config_reset_failed'),
                            provider_added: Editor.I18n.t('cocos-mcp.provider_added'),
                            provider_updated: Editor.I18n.t('cocos-mcp.provider_updated'),
                            provider_deleted: Editor.I18n.t('cocos-mcp.provider_deleted'),
                            provider_save_failed: Editor.I18n.t('cocos-mcp.provider_save_failed'),
                            provider_delete_failed: Editor.I18n.t('cocos-mcp.provider_delete_failed'),
                            model_deleted: Editor.I18n.t('cocos-mcp.model_deleted'),
                            model_save_failed: Editor.I18n.t('cocos-mcp.model_save_failed'),
                            model_delete_failed: Editor.I18n.t('cocos-mcp.model_delete_failed'),
                            provider_not_found: Editor.I18n.t('cocos-mcp.provider_not_found'),
                            reset_confirm: Editor.I18n.t('cocos-mcp.reset_confirm')
                        }
                    };
                }, 
                async mounted() {
                    await this.loadConfig();
                },
                methods: {
                    async loadConfig() {
                        this.isLoading = true;
                        try {
                            const config = await Editor.Message.request('cocos-mcp', 'get-image-config');
                            console.log('Loaded config:', config);
                            
                            // The server returns ImageGenerationConfig directly, so we need to wrap it
                            if (config) {
                                this.config.imageGeneration = {
                                    providers: config.providers || [],
                                    defaultProvider: config.defaultProvider || '',
                                    globalSettings: {
                                        timeout: config.timeout || 30000,
                                        retries: config.retries || 3,
                                        quality: config.quality || 'high'
                                    }
                                };
                            } else {
                                console.warn('No config returned, using defaults');
                                this.config.imageGeneration = {
                                    providers: [],
                                    defaultProvider: '',
                                    globalSettings: {
                                        timeout: 30000,
                                        retries: 3,
                                        quality: 'high'
                                    }
                                };
                            }
                        } catch (error) {
                            console.error('Failed to load config:', error);
                            this.showNotification('error', this.i18n.config_load_failed);
                            // Ensure we have a valid structure even on error
                            this.config.imageGeneration = {
                                providers: [],
                                defaultProvider: '',
                                globalSettings: {
                                    timeout: 30000,
                                    retries: 3,
                                    quality: 'high'
                                }
                            };
                        } finally {
                            this.isLoading = false;
                        }
                    },

                    async saveConfig() {
                        this.isLoading = true;
                        try {
                            // Convert our Vue config structure back to the server's expected format
                            // Ensure we only send serializable data (no Maps, functions, etc.)
                            const configToSave = {
                                enabled: true,
                                providers: JSON.parse(JSON.stringify(this.config.imageGeneration.providers)), // Deep clone to remove Vue reactivity
                                defaultProvider: this.config.imageGeneration.defaultProvider,
                                timeout: this.config.imageGeneration.globalSettings.timeout,
                                retries: this.config.imageGeneration.globalSettings.retries,
                                quality: this.config.imageGeneration.globalSettings.quality
                            };
                            
                            console.log('Saving config:', configToSave);
                            await Editor.Message.request('cocos-mcp', 'save-image-config', configToSave);
                            this.showNotification('success', this.i18n.config_saved);
                        } catch (error) {
                            console.error('Failed to save config:', error);
                            this.showNotification('error', this.i18n.config_save_failed);
                        } finally {
                            this.isLoading = false;
                        }
                    },

                    // Provider Management
                    openProviderDialog(provider: any = null) {
                        if (provider) {
                            this.editingProvider = provider;
                            this.newProvider = {
                                id: provider.id,
                                name: provider.name,
                                type: provider.type,
                                baseUrl: provider.config?.baseUrl || '',
                                apiKey: provider.config?.apiKey || '',
                                models: provider.models || []
                            };
                        } else {
                            this.editingProvider = null;
                            this.newProvider = {
                                id: '',
                                name: '',
                                type: 'stable-diffusion',
                                baseUrl: '',
                                apiKey: '',
                                models: []
                            };
                        }
                        this.showProviderDialog = true;
                    },

                    async saveProvider() {
                        try {
                            // Convert our form data to the proper provider structure
                            const providerData = {
                                id: this.newProvider.id || `provider_${Date.now()}`,
                                name: this.newProvider.name,
                                type: this.newProvider.type,
                                enabled: true,
                                config: {
                                    baseUrl: this.newProvider.baseUrl,
                                    apiKey: this.newProvider.apiKey,
                                    timeout: 30000
                                },
                                models: JSON.parse(JSON.stringify(this.newProvider.models || []))
                            };

                            if (this.editingProvider) {
                                // Update existing provider
                                const index = this.config.imageGeneration.providers.findIndex((p: any) => p.id === this.editingProvider.id);
                                if (index !== -1) {
                                    this.config.imageGeneration.providers[index] = providerData;
                                }
                            } else {
                                // Add new provider
                                this.config.imageGeneration.providers.push(providerData);
                            }
                            await this.saveConfig();
                            this.showProviderDialog = false;
                            this.showNotification('success', this.editingProvider ? this.i18n.provider_updated : this.i18n.provider_added);
                        } catch (error) {
                            console.error('Failed to save provider:', error);
                            this.showNotification('error', this.i18n.provider_save_failed);
                        }
                    },

                    async deleteProvider(providerId: string) {
                        try {
                            this.config.imageGeneration.providers = this.config.imageGeneration.providers.filter((p: any) => p.id !== providerId);
                            // Remove models associated with this provider
                            this.config.imageGeneration.providers.forEach((p: any) => {
                                p.models = p.models.filter((m: any) => m.providerId !== providerId);
                            });
                            await this.saveConfig();
                            this.showNotification('success', this.i18n.provider_deleted);
                        } catch (error) {
                            console.error('Failed to delete provider:', error);
                            this.showNotification('error', this.i18n.provider_delete_failed);
                        }
                    },

                    async testProvider(providerId: string) {
                        this.isLoading = true;
                        try {
                            console.log('Testing provider:', providerId);
                            const result = await Editor.Message.request('cocos-mcp', 'test-provider', {
                                providerId,
                                testPrompt: 'A simple test image'
                            });
                            
                            console.log('Test result:', result);
                            this.testResults.set(providerId, result);
                            
                            if (result.success) {
                                this.showNotification('success', `Provider test successful: ${result.message}`);
                            } else {
                                this.showNotification('error', `Provider test failed: ${result.error}`);
                                
                                // Log debug information if available
                                if (result.debug) {
                                    console.error('Provider test debug info:', result.debug);
                                }
                            }
                        } catch (error: any) {
                            console.error('Failed to test provider:', error);
                            this.testResults.set(providerId, { success: false, error: error.message });
                            this.showNotification('error', 'Failed to test provider: ' + error.message);
                        } finally {
                            this.isLoading = false;
                        }
                    },

                    // Model Management
                    openModelDialog(model: any = null, providerId = '') {
                        if (model) {
                            this.editingModel = model;
                            this.newModel = {
                                id: model.id,
                                name: model.name,
                                type: model.provider || 'text2img',  // Map provider field back to type
                                providerId: providerId
                            };
                        } else {
                            this.editingModel = null;
                            this.newModel = {
                                id: '',
                                name: '',
                                type: 'text2img',
                                providerId: providerId || ''
                            };
                        }
                        this.showModelDialog = true;
                    },

                    async saveModel() {
                        try {
                            const provider = this.config.imageGeneration.providers.find((p: any) => p.id === this.newModel.providerId);
                            if (!provider) {
                                this.showNotification('error', this.i18n.provider_not_found);
                                return;
                            }

                            // Convert our form data to the proper model structure
                            const modelData = {
                                id: this.newModel.id || `model_${Date.now()}`,
                                name: this.newModel.name,
                                description: this.newModel.name,
                                provider: this.newModel.type,  // This should match the model interface
                                enabled: true
                            };

                            if (this.editingModel) {
                                // Update existing model
                                const index = provider.models.findIndex((m: any) => m.id === this.editingModel.id);
                                if (index !== -1) {
                                    provider.models[index] = modelData;
                                }
                            } else {
                                // Add new model
                                provider.models.push(modelData);
                            }
                            await this.saveConfig();
                            this.showModelDialog = false;
                        } catch (error) {
                            console.error('Failed to save model:', error);
                            this.showNotification('error', this.i18n.model_save_failed);
                        }
                    },

                    async deleteModel(providerId: string, modelId: string) {
                        try {
                            const provider = this.config.imageGeneration.providers.find((p: any) => p.id === providerId);
                            if (provider) {
                                provider.models = provider.models.filter((m: any) => m.id !== modelId);
                                await this.saveConfig();
                                this.showNotification('success', this.i18n.model_deleted);
                            }
                        } catch (error) {
                            console.error('Failed to delete model:', error);
                            this.showNotification('error', this.i18n.model_delete_failed);
                        }
                    },

                    async fetchModels(provider: any) {
                        this.isLoading = true;
                        try {
                            console.log('Fetching models for provider:', provider.id);
                            const result = await Editor.Message.request('cocos-mcp', 'fetch-provider-models', {
                                providerId: provider.id
                            });
                            
                            console.log('Fetch models result:', result);
                            
                            if (result.success && result.models) {
                                // Update the provider with fetched models, all enabled by default
                                provider.models = result.models.map((model: any) => ({
                                    id: model.id,
                                    name: model.name || model.id,
                                    description: model.description || `${provider.name} model`,
                                    provider: provider.type, // Use the provider's type
                                    enabled: true // Enable all fetched models by default
                                }));
                                
                                await this.saveConfig();
                                this.showNotification('success', `Fetched ${result.models.length} models from ${provider.name}. You can now enable/disable individual models.`);
                                console.log('Successfully fetched and saved models:', result.models);
                            } else {
                                this.showNotification('error', result.error || 'Failed to fetch models');
                                
                                // Log debug information if available
                                if (result.debug) {
                                    console.error('Fetch models debug info:', result.debug);
                                }
                            }
                        } catch (error: any) {
                            console.error('Failed to fetch models:', error);
                            this.showNotification('error', 'Failed to fetch models: ' + (error.message || error));
                        } finally {
                            this.isLoading = false;
                        }
                    },

                    async toggleAllModels(provider: any, enabled: boolean) {
                        if (provider.models) {
                            provider.models.forEach((model: any) => {
                                model.enabled = enabled;
                            });
                            await this.saveConfig();
                            this.showNotification('success', `${enabled ? 'Enabled' : 'Disabled'} all models for ${provider.name}`);
                        }
                    },

                    // Configuration Management
                    async exportConfig() {
                        try {
                            // Create a clean export object without Vue reactivity or non-serializable data
                            const exportData = {
                                imageGeneration: {
                                    providers: JSON.parse(JSON.stringify(this.config.imageGeneration.providers)),
                                    defaultProvider: this.config.imageGeneration.defaultProvider,
                                    globalSettings: {
                                        timeout: this.config.imageGeneration.globalSettings.timeout,
                                        retries: this.config.imageGeneration.globalSettings.retries,
                                        quality: this.config.imageGeneration.globalSettings.quality
                                    }
                                }
                            };
                            
                            const config = JSON.stringify(exportData, null, 2);
                            const blob = new Blob([config], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'ai-config.json';
                            a.click();
                            URL.revokeObjectURL(url);
                            this.showNotification('success', this.i18n.config_exported);
                        } catch (error) {
                            console.error('Failed to export config:', error);
                            this.showNotification('error', this.i18n.config_export_failed);
                        }
                    },

                    async importConfig(event: Event) {
                        const input = event.target as HTMLInputElement;
                        const file = input.files?.[0];
                        if (!file) return;

                        try {
                            const text = await file.text();
                            const importedData = JSON.parse(text);
                            
                            // Handle different import formats
                            if (importedData.imageGeneration) {
                                // Full config format
                                this.config.imageGeneration = {
                                    providers: importedData.imageGeneration.providers || [],
                                    defaultProvider: importedData.imageGeneration.defaultProvider || '',
                                    globalSettings: importedData.imageGeneration.globalSettings || {
                                        timeout: 30000,
                                        retries: 3,
                                        quality: 'high'
                                    }
                                };
                            } else if (importedData.providers) {
                                // Direct config format
                                this.config.imageGeneration = {
                                    providers: importedData.providers || [],
                                    defaultProvider: importedData.defaultProvider || '',
                                    globalSettings: {
                                        timeout: importedData.timeout || 30000,
                                        retries: importedData.retries || 3,
                                        quality: importedData.quality || 'high'
                                    }
                                };
                            } else {
                                throw new Error('Invalid configuration format');
                            }
                            
                            await this.saveConfig();
                            this.showNotification('success', this.i18n.config_imported);
                            
                            // Reset file input
                            input.value = '';
                        } catch (error) {
                            console.error('Failed to import config:', error);
                            this.showNotification('error', this.i18n.config_import_failed + ': ' + (error instanceof Error ? error.message : 'Invalid file format'));
                            
                            // Reset file input
                            input.value = '';
                        }
                    },

                    async resetConfig() {
                        if (confirm(this.i18n.reset_confirm)) {
                            try {
                                await Editor.Message.request('cocos-mcp', 'reset-image-config');
                                await this.loadConfig();
                                this.showNotification('success', this.i18n.config_reset);
                            } catch (error) {
                                console.error('Failed to reset config:', error);
                                this.showNotification('error', this.i18n.config_reset_failed);
                            }
                        }
                    },

                    // Utility Methods
                    showNotification(type: string, message: string) {
                        this.notification = {
                            show: true,
                            type,
                            message
                        };
                        setTimeout(() => {
                            this.notification.show = false;
                        }, 5000);
                    },

                    getProviderIcon(type: string) {
                        const icons: Record<string, string> = {
                            'stable-diffusion': '🎨',
                            'automatic1111': '🚀',
                            'dall-e': '🤖',
                            'custom': '⚙️'
                        };
                        return icons[type] || '🔧';
                    }
                },

                template: `
                    <div class="ai-config-panel">
                        <div class="panel-header">
                            <h2>{{ i18n.ai_image_config }}</h2>
                            <div class="header-actions">
                                <button @click="loadConfig()" :disabled="isLoading" class="btn btn-secondary">
                                    🔄 {{ i18n.refresh }}
                                </button>
                                <button @click="exportConfig()" class="btn btn-secondary">{{ i18n.export }}</button>
                                <label class="btn btn-secondary">
                                    {{ i18n.import }}
                                    <input type="file" @change="importConfig" accept=".json" style="display: none">
                                </label>
                                <button @click="resetConfig()" class="btn btn-danger">{{ i18n.reset }}</button>
                            </div>
                        </div>

                        <!-- Notification -->
                        <div v-if="notification.show" :class="'notification notification-' + notification.type">
                            {{ notification.message }}
                        </div>

                        <!-- Loading Overlay -->
                        <div v-if="isLoading" class="loading-overlay">
                            <div class="spinner"></div>
                            <div>{{ i18n.loading }}</div>
                        </div>

                        <!-- Providers Section -->
                        <div class="section">
                            <div class="section-header">
                                <h3>{{ i18n.providers }}</h3>
                                <button @click="openProviderDialog()" class="btn btn-primary">{{ i18n.add_provider }}</button>
                            </div>
                            
                            <div v-if="config.imageGeneration.providers && config.imageGeneration.providers.length === 0" class="empty-state">
                                <p>{{ i18n.no_providers }}</p>
                            </div>
                            
                            <div v-else-if="config.imageGeneration.providers && config.imageGeneration.providers.length > 0" class="providers-grid">
                                <div v-for="provider in config.imageGeneration.providers" :key="provider.id" class="provider-card">
                                    <div class="provider-header">
                                        <span class="provider-icon">{{ getProviderIcon(provider.type) }}</span>
                                        <h4>{{ provider.name }}</h4>
                                        <div class="provider-actions">
                                            <button @click="testProvider(provider.id)" class="btn btn-sm btn-secondary">{{ i18n.test }}</button>
                                            <button @click="openProviderDialog(provider)" class="btn btn-sm btn-secondary">{{ i18n.edit }}</button>
                                            <button @click="deleteProvider(provider.id)" class="btn btn-sm btn-danger">{{ i18n.delete }}</button>
                                        </div>
                                    </div>
                                    <div class="provider-details">
                                        <p><strong>{{ i18n.type }}:</strong> {{ provider.type }}</p>
                                        <p><strong>{{ i18n.url }}:</strong> {{ provider.baseUrl || provider.config?.baseUrl || i18n.not_configured }}</p>
                                        <p><strong>{{ i18n.models }}:</strong> 
                                            <span v-if="provider.models && provider.models.length > 0">
                                                {{ provider.models.filter(m => m.enabled).length }} {{ i18n.enabled }} / {{ provider.models.length }} {{ i18n.total }}
                                            </span>
                                            <span v-else>0</span>
                                        </p>
                                        <div v-if="testResults.has(provider.id)" :class="'test-result test-' + (testResults.get(provider.id).success ? 'success' : 'error')">
                                            <div class="test-summary">
                                                {{ testResults.get(provider.id).success ? i18n.connection_successful : i18n.connection_failed }}
                                            </div>
                                            <div v-if="testResults.get(provider.id).message" class="test-message">
                                                {{ testResults.get(provider.id).message }}
                                            </div>
                                            <div v-if="!testResults.get(provider.id).success && testResults.get(provider.id).error" class="test-error">
                                                <strong>{{ i18n.error }}:</strong> {{ testResults.get(provider.id).error }}
                                            </div>
                                            <div v-if="testResults.get(provider.id).debug" class="test-debug">
                                                <details>
                                                    <summary>{{ i18n.debug_information }}</summary>
                                                    <pre>{{ JSON.stringify(testResults.get(provider.id).debug, null, 2) }}</pre>
                                                </details>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Models for this provider -->
                                    <div class="models-section">
                                        <div class="models-header">
                                            <strong>{{ i18n.models }}:</strong>
                                            <div class="models-actions">
                                                <button @click="fetchModels(provider)" class="btn btn-xs btn-info" :disabled="!provider.baseUrl && !provider.config?.baseUrl">
                                                    {{ i18n.fetch_models }}
                                                </button>
                                                <button v-if="provider.models && provider.models.length > 0" @click="toggleAllModels(provider, true)" class="btn btn-xs btn-secondary">
                                                    {{ i18n.enable_all }}
                                                </button>
                                                <button v-if="provider.models && provider.models.length > 0" @click="toggleAllModels(provider, false)" class="btn btn-xs btn-secondary">
                                                    {{ i18n.disable_all }}
                                                </button>
                                            </div>
                                        </div>
                                        <div v-if="provider.models && provider.models.length > 0" class="models-list">
                                            <div v-for="model in provider.models" :key="model.id" class="model-item checkbox-style">
                                                <label class="model-checkbox-label">
                                                    <input 
                                                        type="checkbox" 
                                                        v-model="model.enabled" 
                                                        @change="saveConfig()"
                                                        class="model-checkbox"
                                                    />
                                                    <span class="model-info">
                                                        <strong>{{ model.name }}</strong>
                                                        <small v-if="model.description">{{ model.description }}</small>
                                                        <small class="model-id">ID: {{ model.id }}</small>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                        <div v-else class="empty-models">
                                            <p>{{ i18n.no_models }}</p>
                                            <p v-if="provider.baseUrl || provider.config?.baseUrl">
                                                {{ i18n.fetch_models_hint }}
                                            </p>
                                            <p v-else>
                                                {{ i18n.configure_url_hint }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Global Settings Section -->
                        <div class="section">
                            <h3>{{ i18n.global_settings }}</h3>
                            <div class="settings-grid">
                                <div class="setting-item">
                                    <label>{{ i18n.default_provider }}:</label>
                                    <select v-model="config.imageGeneration.defaultProvider">
                                        <option value="">{{ i18n.select_provider }}</option>
                                        <option v-for="provider in (config.imageGeneration.providers || [])" :key="provider.id" :value="provider.id">
                                            {{ provider.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label>{{ i18n.request_timeout }}:</label>
                                    <input type="number" v-model.number="config.imageGeneration.globalSettings.timeout" min="1000" max="300000">
                                </div>
                                <div class="setting-item">
                                    <label>{{ i18n.max_retries }}:</label>
                                    <input type="number" v-model.number="config.imageGeneration.globalSettings.retries" min="0" max="10">
                                </div>
                                <div class="setting-item">
                                    <label>{{ i18n.default_quality }}:</label>
                                    <select v-model="config.imageGeneration.globalSettings.quality">
                                        <option value="low">{{ i18n.quality_low }}</option>
                                        <option value="medium">{{ i18n.quality_medium }}</option>
                                        <option value="high">{{ i18n.quality_high }}</option>
                                        <option value="ultra">{{ i18n.quality_ultra }}</option>
                                    </select>
                                </div>
                            </div>
                            <button @click="saveConfig()" class="btn btn-primary">{{ i18n.save_global_settings }}</button>
                        </div>

                        <!-- Provider Dialog -->
                        <div v-if="showProviderDialog" class="dialog-overlay" @click="showProviderDialog = false">
                            <div class="dialog" @click.stop>
                                <div class="dialog-header">
                                    <h3>{{ editingProvider ? i18n.edit_provider : i18n.add_provider_title }}</h3>
                                    <button @click="showProviderDialog = false" class="btn btn-sm btn-secondary">✕</button>
                                </div>
                                <div class="dialog-body">
                                    <div class="form-group">
                                        <label>{{ i18n.provider_id }}:</label>
                                        <input type="text" v-model="newProvider.id" :disabled="!!editingProvider" placeholder="unique-provider-id">
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.provider_name }}:</label>
                                        <input type="text" v-model="newProvider.name" placeholder="Provider Name">
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.provider_type }}:</label>
                                        <select v-model="newProvider.type">
                                            <option value="stable-diffusion">{{ i18n.stable_diffusion }}</option>
                                            <option value="automatic1111">{{ i18n.automatic1111 }}</option>
                                            <option value="dall-e">{{ i18n.dall_e }}</option>
                                            <option value="custom">{{ i18n.custom_provider }}</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.base_url }}:</label>
                                        <input type="url" v-model="newProvider.baseUrl" placeholder="https://api.provider.com">
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.api_key }}:</label>
                                        <input type="password" v-model="newProvider.apiKey" placeholder="API Key">
                                    </div>
                                </div>
                                <div class="dialog-footer">
                                    <button @click="showProviderDialog = false" class="btn btn-secondary">{{ i18n.cancel }}</button>
                                    <button @click="saveProvider()" class="btn btn-primary">{{ editingProvider ? i18n.update_provider : i18n.add_provider_title }}</button>
                                </div>
                            </div>
                        </div>

                        <!-- Model Dialog -->
                        <div v-if="showModelDialog" class="dialog-overlay" @click="showModelDialog = false">
                            <div class="dialog" @click.stop>
                                <div class="dialog-header">
                                    <h3>{{ editingModel ? i18n.edit_model : i18n.add_model_title }}</h3>
                                    <button @click="showModelDialog = false" class="btn btn-sm btn-secondary">✕</button>
                                </div>
                                <div class="dialog-body">
                                    <div class="form-group">
                                        <label>{{ i18n.model_id }}:</label>
                                        <input type="text" v-model="newModel.id" :disabled="!!editingModel" placeholder="model-identifier">
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.model_name }}:</label>
                                        <input type="text" v-model="newModel.name" placeholder="Model Display Name">
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.model_provider }}:</label>
                                        <select v-model="newModel.providerId" :disabled="!!editingModel">
                                            <option v-for="provider in (config.imageGeneration.providers || [])" :key="provider.id" :value="provider.id">
                                                {{ provider.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>{{ i18n.model_type }}:</label>
                                        <select v-model="newModel.type">
                                            <option value="text2img">{{ i18n.text_to_image }}</option>
                                            <option value="img2img">{{ i18n.image_to_image }}</option>
                                            <option value="inpainting">{{ i18n.inpainting }}</option>
                                            <option value="outpainting">{{ i18n.outpainting }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="dialog-footer">
                                    <button @click="showModelDialog = false" class="btn btn-secondary">{{ i18n.cancel }}</button>
                                    <button @click="saveModel()" class="btn btn-primary">{{ editingModel ? i18n.update_model : i18n.add_model }}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            }));

            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
            panelDataMap.delete(this);
        }
    },
});
