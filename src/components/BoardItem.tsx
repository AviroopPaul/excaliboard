import { FileEdit, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Board } from "../lib/db";
import { formatDistanceToNow } from "date-fns";
import { db } from "../lib/db";
import { Modal } from "./Modal";
import { ConfirmModal } from "./ConfirmModal";
import { useState, useRef, useEffect } from "react";

interface BoardItemProps {
  board: Board;
}

export function BoardItem({ board }: BoardItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmRename = async (newName: string) => {
    if (newName !== board.name) {
      await db.boards.update(board.id, { name: newName });
    }
  };

  const confirmDelete = async () => {
    await db.boards.delete(board.id);
  };

  return (
    <div className="relative group">
      <Link
        to={`/board/${board.id}`}
        className="flex flex-col p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer aspect-square justify-between"
      >
        <div className="flex items-center justify-center flex-1">
          <FileEdit className="w-12 h-12 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
        </div>
        <div className="text-center w-full">
          <h3
            className="text-sm font-medium text-gray-900 truncate w-full"
            title={board.name}
          >
            {board.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
          </p>
        </div>
      </Link>

      <button
        onClick={handleMenuClick}
        className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 bg-white border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-8 right-2 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[140px]"
        >
          <button
            onClick={handleRename}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
        title="Rename Board"
        placeholder="Board name"
        defaultValue={board.name}
        confirmText="Rename"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Board"
        message={`Are you sure you want to delete "${board.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
