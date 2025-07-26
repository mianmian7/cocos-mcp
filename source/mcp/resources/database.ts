import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpServerManager } from "../server-manager";

export function registerDatabaseResource(server: McpServer): void {
  server.registerResource(
    "database",
    new ResourceTemplate("db://{path}", { list: undefined }),
    {
      title: "Cocos Creator Database",
      description: "Universal access to Cocos Creator database",
      mimeType: "application/json"
    },
    async (uri, { path }) => {
      try {
        // Access Cocos Creator database through Asset Manager
        const pathStr = decodeURIComponent(uri.href);
        if (pathStr.includes("db://db://")) {
          pathStr.replace("db://db://", "db://");
        }
        let dbQuery = await Editor.Message.request('asset-db', 'query-assets', {});
        
        if (!dbQuery) {
          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify({ 
                error: `Database path ${path} not found or inaccessible` 
              })
            }]
          };
        }

        dbQuery = dbQuery.filter(item => item.url.startsWith(pathStr));

        // Format database results
        const dbResults = {
          path: pathStr,
          query_time: new Date().toISOString(),
          results: dbQuery.map((item: any) => ({
            uuid: McpServerManager.encodeUuid(item.uuid),
            name: item.name,
            url: item.url,
            type: item.type
          }))
        };

        return {
          contents: [{
            uri: uri.href,
            mimeType: "text/json",
            text: JSON.stringify(dbResults)
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: "text/json",
            text: JSON.stringify({ 
              error: `Failed to query database path ${path}`,
              details: error instanceof Error ? error.message : String(error)
            })
          }]
        };
      }
    }
  );
}