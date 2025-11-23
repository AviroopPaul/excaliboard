import { useLiveQuery } from "dexie-react-hooks";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/db";
import { FolderItem } from "./FolderItem";
import { BoardItem } from "./BoardItem";
import { Modal } from "./Modal";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";

export function Dashboard() {
  const { folderId } = useParams();
  // Use "root" string instead of null because IndexedDB keys cannot be null
  const currentFolderId = folderId || "root";
  const [userName, setUserName] = useState<string>("User");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "folder" | "board" | null;
  }>({ isOpen: false, type: null });

  const folders = useLiveQuery(
    () => db.folders.where({ parentId: currentFolderId }).toArray(),
    [currentFolderId]
  );

  const boards = useLiveQuery(
    () => db.boards.where({ folderId: currentFolderId }).toArray(),
    [currentFolderId]
  );

  const currentFolder = useLiveQuery(
    async () => (folderId ? await db.folders.get(folderId) : null),
    [folderId]
  );

  useEffect(() => {
    // Get user name from localStorage
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }

    // Listen for userName updates
    const handleUserNameUpdate = () => {
      const updatedName = localStorage.getItem("userName");
      if (updatedName) {
        setUserName(updatedName);
      }
    };

    window.addEventListener("userNameUpdated", handleUserNameUpdate);

    return () => {
      window.removeEventListener("userNameUpdated", handleUserNameUpdate);
    };
  }, []);

  const createFolder = () => {
    setModalState({ isOpen: true, type: "folder" });
  };

  const createBoard = () => {
    setModalState({ isOpen: true, type: "board" });
  };

  const handleModalConfirm = async (name: string) => {
    if (modalState.type === "folder") {
      await db.folders.add({
        id: uuidv4(),
        name,
        parentId: currentFolderId,
        createdAt: Date.now(),
      });
    } else if (modalState.type === "board") {
      await db.boards.add({
        id: uuidv4(),
        name,
        folderId: currentFolderId,
        content: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, type: null });
  };

  if (folders === undefined || boards === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isRoot = currentFolderId === "root";
  const parentLink =
    currentFolder?.parentId === "root"
      ? "/"
      : `/folder/${currentFolder?.parentId}`;

  return (
    <div className="p-8 bg-gray-50">
      <header className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {!isRoot && (
            <Link
              to={parentLink}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {currentFolder ? currentFolder.name : `${userName}'s Boards`}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={createFolder}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Folder
          </button>
          <button
            onClick={createBoard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Board
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {folders?.map((folder) => (
            <FolderItem key={folder.id} folder={folder} />
          ))}
          {boards?.map((board) => (
            <BoardItem key={board.id} board={board} />
          ))}
        </div>

        {folders?.length === 0 && boards?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mt-8">
            <p className="text-lg font-medium">This folder is empty</p>
            <p className="text-sm mt-2">
              Create a new board or folder to get started.
            </p>
          </div>
        )}
      </main>

      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={modalState.type === "folder" ? "Create New Folder" : "Create New Board"}
        placeholder={modalState.type === "folder" ? "Folder name" : "Board name"}
        confirmText="Create"
      />
    </div>
  );
}
