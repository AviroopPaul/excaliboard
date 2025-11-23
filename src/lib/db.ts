import Dexie, { type EntityTable } from "dexie";

export interface Folder {
  id: string;
  name: string;
  parentId: string; // "root" for top-level
  createdAt: number;
}

export interface Board {
  id: string;
  name: string;
  folderId: string; // "root" for top-level
  content: any; // Excalidraw elements
  appState?: any; // Excalidraw app state (view position, etc.)
  createdAt: number;
  updatedAt: number;
}

const db = new Dexie("ExcaliWhiteboardDB") as Dexie & {
  folders: EntityTable<Folder, "id">;
  boards: EntityTable<Board, "id">;
};

db.version(1).stores({
  folders: "id, parentId, createdAt",
  boards: "id, folderId, createdAt, updatedAt",
});

export { db };
