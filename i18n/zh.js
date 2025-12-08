"use strict";

module.exports = {
    // Package description
    description: "使用 Streamable HTTP 协议的 MCP 服务器来控制 Cocos Creator",
    
    // Menu items
    open_panel: "MCP 服务器控制面板",
    open_ai_config: "AI 图像配置",
    
    // MCP Server Control Panel
    mcp_server_control: "MCP 服务器控制",
    status_running: "运行中",
    status_stopped: "已停止",
    
    // Server config labels
    port: "端口",
    name: "名称",
    version: "版本",
    auto_start: "自动启动",
    auto_start_hint: "(扩展加载时自动启动服务器)",
    
    // Server control buttons
    start_server: "启动服务器",
    stop_server: "停止服务器",
    starting: "启动中...",
    stopping: "停止中...",
    
    // Tools section
    available_tools: "可用工具",
    
    // Tool categories
    core_tools: "核心工具",
    scene_assets: "场景与资源",
    discovery: "发现",
    generation_project: "生成与项目",
    file_system_tools: "⚠️ 文件系统工具",
    code_execution_tools: "⚠️ 代码执行工具",
    
    // Tool names
    create_nodes: "创建节点",
    modify_nodes: "修改节点",
    query_nodes: "查询节点",
    query_components: "查询组件",
    modify_components: "修改组件",
    scene_operations: "场景操作",
    prefab_operations: "预制体操作",
    asset_operations: "资源操作",
    linked_prefab_operations: "关联预制体操作",
    get_component_types: "获取组件类型",
    get_asset_types: "获取资源类型",
    get_assets_by_type: "按类型获取资源",
    generate_image_assets: "生成图像资源",
    project_settings: "项目设置",
    advanced_file_operations: "高级文件操作",
    execute_scene_code: "执行场景代码",
    
    // Security warnings
    file_operations_warning: "⚠️ 允许 AI 直接读取、写入和修改项目文件",
    code_execution_warning: "⚠️ 允许 AI 在场景上下文中执行任意代码",
    
    // Server info section
    server_information: "服务器信息",
    url: "地址",
    active_tools: "已启用工具",
    
    // MCP client config section
    copy_config: "复制配置",
    
    // AI Config Panel
    ai_image_config: "🎨 AI 图像生成配置",
    refresh: "刷新",
    export: "📤 导出",
    import: "📥 导入",
    reset: "🔄 重置",
    loading: "加载中...",
    
    // Providers section
    providers: "🔧 提供商",
    add_provider: "+ 添加提供商",
    no_providers: "尚未配置提供商。添加您的第一个 AI 图像生成提供商以开始使用。",
    test: "🧪 测试",
    edit: "✏️ 编辑",
    delete: "🗑️ 删除",
    type: "类型",
    not_configured: "未配置",
    models: "模型",
    enabled: "已启用",
    total: "总计",
    connection_successful: "✅ 连接成功",
    connection_failed: "❌ 连接失败",
    error: "错误",
    debug_information: "🔍 调试信息",
    
    // Models section
    fetch_models: "🔄 获取模型",
    enable_all: "✅ 全选",
    disable_all: "❌ 全不选",
    no_models: "暂无可用模型。",
    fetch_models_hint: "点击「获取模型」从您的 API 发现可用模型。",
    configure_url_hint: "请先配置基础 URL，然后点击「获取模型」。",
    
    // Global settings
    global_settings: "⚙️ 全局设置",
    default_provider: "默认提供商",
    select_provider: "选择提供商...",
    request_timeout: "请求超时 (毫秒)",
    max_retries: "最大重试次数",
    default_quality: "默认质量",
    quality_low: "低",
    quality_medium: "中",
    quality_high: "高",
    quality_ultra: "超高",
    save_global_settings: "💾 保存全局设置",
    
    // Provider dialog
    edit_provider: "编辑提供商",
    add_provider_title: "添加提供商",
    provider_id: "提供商 ID",
    provider_name: "名称",
    provider_type: "类型",
    base_url: "基础 URL",
    api_key: "API 密钥 (可选)",
    cancel: "取消",
    update_provider: "更新提供商",
    
    // Provider types
    stable_diffusion: "Stable Diffusion",
    automatic1111: "AUTOMATIC1111",
    dall_e: "OpenAI DALL-E",
    custom_provider: "自定义提供商",
    
    // Model dialog
    edit_model: "编辑模型",
    add_model_title: "添加模型",
    model_id: "模型 ID",
    model_name: "名称",
    model_provider: "提供商",
    model_type: "类型",
    text_to_image: "文生图",
    image_to_image: "图生图",
    inpainting: "图像修复",
    outpainting: "图像扩展",
    update_model: "更新模型",
    add_model: "添加模型",
    
    // Notifications
    config_saved: "配置保存成功",
    config_save_failed: "配置保存失败",
    config_load_failed: "配置加载失败",
    config_exported: "配置导出成功",
    config_export_failed: "配置导出失败",
    config_imported: "配置导入成功",
    config_import_failed: "配置导入失败",
    config_reset: "配置已重置为默认值",
    config_reset_failed: "配置重置失败",
    provider_added: "提供商添加成功",
    provider_updated: "提供商更新成功",
    provider_deleted: "提供商删除成功",
    provider_save_failed: "提供商保存失败",
    provider_delete_failed: "提供商删除失败",
    provider_test_success: "提供商测试成功",
    provider_test_failed: "提供商测试失败",
    model_deleted: "模型删除成功",
    model_save_failed: "模型保存失败",
    model_delete_failed: "模型删除失败",
    models_fetched: "个模型获取成功",
    models_fetch_failed: "模型获取失败",
    all_models_enabled: "已启用所有模型：",
    all_models_disabled: "已禁用所有模型：",
    provider_not_found: "未找到提供商",
    
    // Confirm dialogs
    reset_confirm: "确定要将配置重置为默认值吗？这将删除所有提供商和模型。",
    
    // Image generator panel
    generating_image: "正在从 SVG 生成图像...",
    
    // Panel titles (for package.json)
    panel_mcp_settings: "MCP 服务器设置",
    panel_image_generator: "图像生成器",
    panel_ai_config: "AI 图像配置"
};
