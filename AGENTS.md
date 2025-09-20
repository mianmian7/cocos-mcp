# Repository Guidelines

## Project Structure & Module Organization
- 主要目录：`source/`（TS 源码：`main.ts`、`mcp/`、`panels/`、`scene/`、`types/`），`dist/`（构建产物），`i18n/`（多语言），`static/`（静态资源），`scripts/`（构建脚本），根配置：`package.json`、`tsconfig.json`、`base.tsconfig.json`。
- 禁止直接修改 `dist/`；所有改动在 `source/` 完成并通过编译输出。

## Build, Test, and Development Commands
- 安装依赖：`npm install`（触发 `scripts/preinstall.js` 的 Cocos 类型检查）。
- 构建产物：`npm run build`（调用 TypeScript 编译，输出到 `dist/`）。
- 本地运行：在 Cocos Creator 中打开 `Panel -> cocos-mcp -> MCP Server Settings / Control Panel`，点击 Start；服务地址 `http://localhost:3000/mcp`。
- 可选监听：`npx tsc -w` 用于增量编译。

## Coding Style & Naming Conventions
- 语言：TypeScript（严格模式，CommonJS 模块）。缩进 2 空格，UTF-8 编码。
- 文件/目录：使用 `kebab-case`（如 `server-manager.ts`）；类名 PascalCase，函数/变量 camelCase。
- 导出：优先具名导出；避免引入未使用的依赖；类型与实现分离。

## Testing Guidelines
- 目前未集成测试框架；建议后续在 `tests/` 引入 Jest/Vitest，文件命名 `*.spec.ts`。
- 覆盖重点：`source/mcp/tools/*`、`server-manager.ts` 等核心逻辑与边界条件。
- 在提交前附上手工验证步骤（面板操作路径、调用示例、预期结果）。

## Commit & Pull Request Guidelines
- 提交信息简洁、祈使句，中/英文均可；历史未强制规范，推荐 `type(scope): subject`（例：`feat(mcp): add SSE transport`）。
- PR 必须包含：变更说明、动机/影响、关联 Issue、UI 截图（涉及面板时）、复现与验证步骤、回滚建议。
- 仅提交 `source/` 与必要配置改动；排除 `dist/`、`node_modules/` 与本地环境文件。

## Security & Configuration Tips
- 禁止提交密钥与 `.env`；遵循 `.gitignore`。如遇 `@cocos/creator-types` 版本提示，请在 Creator 中执行“开发者 -> 导出接口定义”至 `node_modules/`。

