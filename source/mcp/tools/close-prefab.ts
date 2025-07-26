import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJSON from '../../../package.json';

export function registerClosePrefabTool(server: McpServer): void {
  server.registerTool(
    "close_prefab",
    {
      title: "Close Prefab",
      description: "Closes the current prefab, with optional save",
      inputSchema: {
        saveChanges: z.boolean().default(true)
      }
    },
    async ({ saveChanges }) => {
      await Editor.Message.request('scene', 'execute-scene-script', { name: packageJSON.name, method: 'startCaptureSceneLogs', args: [] });
      try {
        const errors: string[] = [];
        let saveSuccessful = true;
        let closeSuccessful = false;

        try {
          // Save current prefab if requested
          if (saveChanges) {
            try {
              await Editor.Message.request('scene', 'save-scene');
            } catch (saveError) {
              saveSuccessful = false;
              errors.push(`Error saving prefab before closing: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
            }
          }

          // Close current prefab/scene
          try {
            await Editor.Message.request('scene', 'close-scene');
            closeSuccessful = true;
          } catch (closeError) {
            errors.push(`Error closing prefab: ${closeError instanceof Error ? closeError.message : String(closeError)}`);
          }

        } catch (operationError) {
          errors.push(`Error during prefab close operation: ${operationError instanceof Error ? operationError.message : String(operationError)}`);
        }

        // Build response message
        let message = '';
        
        if (closeSuccessful) {
          message = `Successfully closed prefab.\n`;
          
          if (saveChanges) {
            if (saveSuccessful) {
              message += `Changes were saved before closing.`;
            } else {
              message += `Prefab was closed but there were errors saving changes.`;
            }
          } else {
            message += `Prefab was closed without saving changes.`;
          }
        } else {
          message = `Failed to close prefab.`;
          
          if (saveChanges && saveSuccessful) {
            message += ` (Changes were saved successfully)`;
          } else if (saveChanges && !saveSuccessful) {
            message += ` (Also failed to save changes)`;
          }
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
        
        let errorMessage = `Error closing prefab: ${error instanceof Error ? error.message : String(error)}`;
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