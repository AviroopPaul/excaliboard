import {
  Folder as FolderIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Folder } from "../lib/db";
import { db } from "../lib/db";
import { Modal } from "./Modal";
import { ConfirmModal } from "./ConfirmModal";
import { useState, useRef, useEffect } from "react";

interface FolderItemProps {
  folder: Folder;
}

export function FolderItem({ folder }: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowRenameModal(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    // Check if folder has children
    const childFolders = await db.folders
      .where({ parentId: folder.id })
      .count();
    const childBoards = await db.boards.where({ folderId: folder.id }).count();

    if (childFolders > 0 || childBoards > 0) {
      setDeleteMessage(
        `"${folder.name}" contains ${childFolders} folder(s) and ${childBoards} board(s). All contents will be permanently deleted.`
      );
    } else {
      setDeleteMessage(
        `Are you sure you want to delete "${folder.name}"? This action cannot be undone.`
      );
    }

    setShowDeleteModal(true);
  };

  const confirmRename = async (newName: string) => {
    if (newName !== folder.name) {
      await db.folders.update(folder.id, { name: newName });
    }
  };

  const confirmDelete = async () => {
    // Check if folder has children
    const childFolders = await db.folders
      .where({ parentId: folder.id })
      .count();
    const childBoards = await db.boards.where({ folderId: folder.id }).count();

    if (childFolders > 0 || childBoards > 0) {
      // Recursively delete all contents
      await deleteFolder(folder.id);
    } else {
      await db.folders.delete(folder.id);
    }

    // Navigate to parent if we're currently inside this folder
    if (window.location.pathname.includes(folder.id)) {
      navigate(folder.parentId === "root" ? "/" : `/folder/${folder.parentId}`);
    }
  };

  const deleteFolder = async (folderId: string) => {
    // Get all child folders
    const childFolders = await db.folders
      .where({ parentId: folderId })
      .toArray();

    // Recursively delete child folders
    for (const child of childFolders) {
      await deleteFolder(child.id);
    }

    // Delete all boards in this folder
    const childBoards = await db.boards.where({ folderId }).toArray();
    for (const board of childBoards) {
      await db.boards.delete(board.id);
    }

    // Finally delete the folder itself
    await db.folders.delete(folderId);
  };

  return (
    <div className="relative group">
      <Link
        to={`/folder/${folder.id}`}
        className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow cursor-pointer aspect-square justify-center"
      >
        <FolderIcon className="w-12 h-12 text-blue-400 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200 truncate w-full text-center select-none">
          {folder.name}
        </span>
      </Link>

      <button
        onClick={handleMenuClick}
        className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
      >
        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-8 right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 min-w-[140px]"
        >
          <button
            onClick={handleRename}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={confirmRename}
        title="Rename Folder"
        placeholder="Folder name"
        defaultValue={folder.name}
        confirmText="Rename"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Folder"
        message={deleteMessage}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
