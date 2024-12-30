import { kebabCase } from "service/kebabCase";
import { Editor, Notice, Plugin, requestUrl } from "obsidian";
import { OllamaSettingTab } from "OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";

export class Ollama extends Plugin {
  settings: OllamaSettings;

  async onload() {
    await this.loadSettings();
    this.addPromptCommands();
    this.addSettingTab(new OllamaSettingTab(this.app, this));
  }

  private addPromptCommands() {
    this.settings.commands.forEach((command) => {
      this.addCommand({
        id: command.name,
        name: command.name,
        editorCallback: async (editor: Editor) => {
          const selection = editor.getSelection();
          
          if (!selection || selection.trim() === '') {
            new Notice("Please select some text first");
            return;
          }
          
          try {
            // Get selection boundaries
            const from = editor.getCursor('from');
            const to = editor.getCursor('to');
            
            // Format and insert user text
            const formattedText = `👤 ${selection.trim()}`;
            editor.replaceRange(formattedText, from, to);
            
            // Calculate the end of inserted text
            const lines = formattedText.split('\n');
            const endLine = from.line + lines.length - 1;
            const lastLineLength = lines[lines.length - 1].length;
            
            // Insert AI marker
            const aiMarker = '\n\n🤖 ';
            const aiMarkerPos = {
              line: endLine,
              ch: lastLineLength
            };
            editor.replaceRange(aiMarker, aiMarkerPos);
            
            // Calculate AI response position
            const aiResponsePosition = {
              line: endLine + 2,
              ch: 3
            };
            
            let streamOutput = "";
            
            // Prepare the prompt
            const cleanedPrompt = selection
              .replace(/\r\n/g, '\n')
              .replace(/\n+/g, ' ')
              .trim();

            const requestBody = {
              prompt: `${command.prompt}\n\n${cleanedPrompt}`,
              model: command.model || this.settings.defaultModel,
              options: {
                temperature: command.temperature || 0.2,
              }
            };

            console.log('Request body:', requestBody);

            const response = await fetch(`${this.settings.ollamaUrl}/api/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Failed to get response reader");
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.trim() === '') continue;
                
                try {
                  const parsed = JSON.parse(line);
                  if (!parsed.response) continue;
                  
                  const newContent = parsed.response;
                  
                  // Update content at AI response position
                  const insertPos = {
                    line: aiResponsePosition.line,
                    ch: aiResponsePosition.ch + streamOutput.length
                  };
                  
                  editor.replaceRange(
                    newContent,
                    insertPos,
                    insertPos
                  );
                  
                  streamOutput += newContent;
                } catch (e) {
                  console.error("Failed to parse JSON:", e);
                }
              }
            }
          } catch (error) {
            console.error("Error:", error);
            new Notice(`Error: ${error.message}`);
          }
        },
      });
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
