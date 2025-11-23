# ExcaliBoard

A collaborative whiteboard application built with [Excalidraw](https://github.com/excalidraw/excalidraw) that extends its functionality to support multiple projects and boards.

## Overview

This project uses Excalidraw as its core drawing engine and extends it with the ability to:

- Create and manage multiple projects
- Add multiple whiteboards within each project
- Organize your work across different boards and projects

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Dexie.js** - In-memory IndexedDB wrapper for local data storage
- **Excalidraw** - Powerful whiteboard and drawing library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server. Open your browser and navigate to the local URL provided (typically `http://localhost:5173`).

## Features

- 📁 **Project Management** - Create and organize multiple projects
- 📋 **Multiple Boards** - Add multiple whiteboards to each project
- 💾 **Local Storage** - All data is stored locally using Dexie.js (IndexedDB)
- 🎨 **Full Excalidraw Features** - Access all the powerful drawing and collaboration features of Excalidraw

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project uses [Excalidraw](https://github.com/excalidraw/excalidraw), which is also licensed under the MIT License.
