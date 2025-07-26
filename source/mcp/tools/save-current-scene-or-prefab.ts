import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';

export function registerSaveCurrentSceneOrPrefabTool(server: McpServer): void {
  server.registerTool(
    "save_current_scene_or_prefab",
    {
      title: "Save Current Scene or Prefab",
      description: "Saves the currently opened scene or prefab",
      inputSchema: {
        // No input parameters needed
      }
    },
    async (args) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let saveSuccessful = false;

        try {
          // Save current scene or prefab
          await Editor.Message.request('scene', 'save-scene');
          saveSuccessful = true;
        } catch (saveError) {
          errors.push(`Error saving scene/prefab: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
        }

        // Build response message
        let message = '';
        
        if (saveSuccessful) {
          message = `Successfully saved current scene or prefab.\n`;
        } else {
          message = `Failed to save current scene or prefab.`;
        }

        if (errors.length > 0) {
          message += `\n\nWarnings/Errors:\n${errors.join('\n')}`;
        }

        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        capturedLogs.forEach(log => message += ("\n" + log));

        return {
          content: [{
            type: "text",
            text: message
          }]
        };

      } catch (error) {
        const capturedLogs: Array<string> = 
          await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'getCapturedSceneLogs', args: [] });
        
        let errorMessage = `Error saving scene/prefab: ${error instanceof Error ? error.message : String(error)}`;
        capturedLogs.forEach(log => errorMessage += ("\n" + log));

        return {
          content: [{
            type: "text",
            text: errorMessage
          }]
        };
      }
    }
  );
}