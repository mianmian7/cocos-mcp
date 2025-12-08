"use strict";

module.exports = {
    // Package description
    description: "MCP server with Streamable HTTP protocol to control Cocos Creator",
    
    // Menu items
    open_panel: "MCP Server Control Panel",
    open_ai_config: "AI Image Configuration",
    
    // MCP Server Control Panel
    mcp_server_control: "MCP Server Control",
    status_running: "RUNNING",
    status_stopped: "STOPPED",
    
    // Server config labels
    port: "Port",
    name: "Name",
    version: "Version",
    auto_start: "Auto Start",
    auto_start_hint: "(Automatically start server when extension loads)",
    
    // Server control buttons
    start_server: "Start Server",
    stop_server: "Stop Server",
    starting: "Starting...",
    stopping: "Stopping...",
    
    // Tools section
    available_tools: "Available Tools",
    
    // Tool categories
    core_tools: "Core Tools",
    scene_assets: "Scene & Assets",
    discovery: "Discovery",
    generation_project: "Generation & Project",
    file_system_tools: "⚠️ File System Tools",
    code_execution_tools: "⚠️ Code Execution Tools",
    
    // Tool names
    create_nodes: "Create Nodes",
    modify_nodes: "Modify Nodes",
    query_nodes: "Query Nodes",
    query_components: "Query Components",
    modify_components: "Modify Components",
    scene_operations: "Scene Operations",
    prefab_operations: "Prefab Operations",
    asset_operations: "Asset Operations",
    linked_prefab_operations: "Linked Prefab Operations",
    get_component_types: "Get Component Types",
    get_asset_types: "Get Asset Types",
    get_assets_by_type: "Get Assets by Type",
    generate_image_assets: "Generate Image Assets",
    project_settings: "Project Settings",
    advanced_file_operations: "Advanced File Operations",
    execute_scene_code: "Execute Scene Code",
    
    // Security warnings
    file_operations_warning: "⚠️ Allows AI to read, write, and modify project files directly",
    code_execution_warning: "⚠️ Allows AI to execute arbitrary code in the scene context",
    
    // Server info section
    server_information: "Server Information",
    url: "URL",
    active_tools: "Active Tools",
    
    // MCP client config section
    copy_config: "Copy Config",
    
    // AI Config Panel
    ai_image_config: "🎨 AI Image Generation Configuration",
    refresh: "Refresh",
    export: "📤 Export",
    import: "📥 Import",
    reset: "🔄 Reset",
    loading: "Loading...",
    
    // Providers section
    providers: "🔧 Providers",
    add_provider: "+ Add Provider",
    no_providers: "No providers configured. Add your first AI image generation provider to get started.",
    test: "🧪 Test",
    edit: "✏️ Edit",
    delete: "🗑️ Delete",
    type: "Type",
    not_configured: "Not configured",
    models: "Models",
    enabled: "enabled",
    total: "total",
    connection_successful: "✅ Connection successful",
    connection_failed: "❌ Connection failed",
    error: "Error",
    debug_information: "🔍 Debug Information",
    
    // Models section
    fetch_models: "🔄 Fetch Models",
    enable_all: "✅ All",
    disable_all: "❌ None",
    no_models: "No models available.",
    fetch_models_hint: "Click \"Fetch Models\" to discover available models from your API.",
    configure_url_hint: "Configure the Base URL first, then click \"Fetch Models\".",
    
    // Global settings
    global_settings: "⚙️ Global Settings",
    default_provider: "Default Provider",
    select_provider: "Select a provider...",
    request_timeout: "Request Timeout (ms)",
    max_retries: "Max Retries",
    default_quality: "Default Quality",
    quality_low: "Low",
    quality_medium: "Medium",
    quality_high: "High",
    quality_ultra: "Ultra",
    save_global_settings: "💾 Save Global Settings",
    
    // Provider dialog
    edit_provider: "Edit Provider",
    add_provider_title: "Add Provider",
    provider_id: "Provider ID",
    provider_name: "Name",
    provider_type: "Type",
    base_url: "Base URL",
    api_key: "API Key (optional)",
    cancel: "Cancel",
    update_provider: "Update Provider",
    
    // Provider types
    stable_diffusion: "Stable Diffusion",
    automatic1111: "AUTOMATIC1111",
    dall_e: "OpenAI DALL-E",
    custom_provider: "Custom Provider",
    
    // Model dialog
    edit_model: "Edit Model",
    add_model_title: "Add Model",
    model_id: "Model ID",
    model_name: "Name",
    model_provider: "Provider",
    model_type: "Type",
    text_to_image: "Text to Image",
    image_to_image: "Image to Image",
    inpainting: "Inpainting",
    outpainting: "Outpainting",
    update_model: "Update Model",
    add_model: "Add Model",
    
    // Notifications
    config_saved: "Configuration saved successfully",
    config_save_failed: "Failed to save configuration",
    config_load_failed: "Failed to load configuration",
    config_exported: "Configuration exported successfully",
    config_export_failed: "Failed to export configuration",
    config_imported: "Configuration imported successfully",
    config_import_failed: "Failed to import configuration",
    config_reset: "Configuration reset to defaults",
    config_reset_failed: "Failed to reset configuration",
    provider_added: "Provider added successfully",
    provider_updated: "Provider updated successfully",
    provider_deleted: "Provider deleted successfully",
    provider_save_failed: "Failed to save provider",
    provider_delete_failed: "Failed to delete provider",
    provider_test_success: "Provider test successful",
    provider_test_failed: "Provider test failed",
    model_deleted: "Model deleted successfully",
    model_save_failed: "Failed to save model",
    model_delete_failed: "Failed to delete model",
    models_fetched: "models fetched successfully",
    models_fetch_failed: "Failed to fetch models",
    all_models_enabled: "Enabled all models for",
    all_models_disabled: "Disabled all models for",
    provider_not_found: "Provider not found",
    
    // Confirm dialogs
    reset_confirm: "Are you sure you want to reset the configuration to defaults? This will remove all providers and models.",
    
    // Image generator panel
    generating_image: "Generating image from SVG...",
    
    // Panel titles (for package.json)
    panel_mcp_settings: "MCP Server Settings",
    panel_image_generator: "Image Generator",
    panel_ai_config: "AI Image Configuration"
};
