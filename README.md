<div align="center">
  
[![Fleece Demo](https://img.youtube.com/vi/_lasT7m_IvM/0.jpg)](https://www.youtube.com/watch?v=_lasT7m_IvM)
> 👆 Click to watch the demo

</div>

This project is a fork of [Ollama](https://github.com/hinterdupfinger/obsidian-ollama). Given the original project's inactivity and my vision for new features, I've created this fork while maintaining compliance with the original project's open source license.

This is a plugin for [Obsidian](https://obsidian.md) that allows you to use [Ollama](https://ollama.ai), (TODO)[GPT](https://platform.openai.com/), (TODO)[Claude](https://www.anthropic.com/), and more AI models within your notes.

This requires a local installation of [Ollama](https://ollama.ai).

## Installation and Setup Guide

### 1. Install the Plugin
> ⚠️ The plugin is currently pending review for the Community Store. In the meantime:
> 1. Download the latest release from the [Releases](https://github.com/your-username/fleece/releases) page
> 2. Extract the downloaded file to your Obsidian plugins folder (`vault/.obsidian/plugins/`)

- Open Obsidian Settings
- Go to Community Plugins
- Search for "Fleece"
- Click Install and Enable

### 2. Install Ollama
- Visit [Ollama.ai](https://ollama.ai)
- Download and install Ollama for your operating system
- Follow the installation instructions for your platform

### 3. Download Ollama Models
- Open terminal/command prompt
- Run `ollama pull <model-name>`
- Example: `ollama pull llama2` or `ollama pull mistral`

### 4. Configure Default Model
- Open Fleece settings in Obsidian
- Select your preferred default model from the dropdown menu
- Save your settings

### 5. Create Custom Commands
- Navigate to Fleece settings
- Click "Add New Command"
- Configure:
  - Command name
  - Prompt template
  - Select model
  - Additional parameters (if needed)

### 6. Update Commands
- Edit existing commands in Fleece settings
- Modify prompts, models, or parameters as needed
- Save changes to update your commands
