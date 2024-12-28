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
        id: kebabCase(command.name),
        name: command.name,
        editorCallback: async (editor: Editor) => {
          const selection = editor.getSelection();
          const text = selection ? selection : editor.getValue();
          const cursorPosition = editor.getCursor();
          
          // If there's a selection, make it bold and add user emoji
          if (selection) {
            const from = editor.getCursor('from');
            const to = editor.getCursor('to');
            editor.replaceRange(`👤:\t**${selection}**`, from, to);
            
            // Move cursor to the end of selection and add AI response line
            editor.setCursor({
              line: to.line,
              ch: to.ch + 8  // Add 8 to account for the emoji, tab and '**' markers
            });
            editor.replaceRange("\n\n🤖:\t", editor.getCursor());
          } else {
            // If no selection, just add both user and AI markers
            editor.replaceRange("\n👤:\t\n🤖:\t", cursorPosition);
          }

          let currentOutput = "";
          let lastOutputLength = 0;  // Track the length of last output

          try {
            const response = await fetch(`${this.settings.ollamaUrl}/api/generate`, {
              method: 'POST',
              body: JSON.stringify({
                prompt: command.prompt + "\n\n" + text,
                model: command.model || this.settings.defaultModel,
                options: {
                  temperature: command.temperature || 0.2,
                },
              })
            });

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Failed to get response reader");

            // Calculate initial insert position
            const insertPosition = selection ? 
              { line: cursorPosition.line + 2, ch: 4 } : 
              { line: cursorPosition.line + 2, ch: 4 };

            // Reset output state
            currentOutput = "";
            editor.replaceRange("", insertPosition, {
              line: insertPosition.line,
              ch: insertPosition.ch + lastOutputLength
            });
            lastOutputLength = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.trim() === '') continue;
                try {
                  const parsed = JSON.parse(line);
                  const newContent = parsed.response;
                  
                  // Update editor content after the robot emoji
                  editor.replaceRange(
                    newContent,
                    {
                      line: insertPosition.line,
                      ch: insertPosition.ch + lastOutputLength
                    },
                    {
                      line: insertPosition.line,
                      ch: insertPosition.ch + lastOutputLength
                    }
                  );
                  
                  lastOutputLength += newContent.length;
                } catch (e) {
                  console.error("Failed to parse JSON:", e);
                }
              }
            }
          } catch (error) {
            new Notice(`Error while generating text: ${error.message}`);
            const errorPosition = selection ? 
              { line: cursorPosition.line + 1, ch: 1 } : 
              cursorPosition;
            editor.replaceRange("", errorPosition, {
              ch: errorPosition.ch + 1,
              line: errorPosition.line,
            });
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
