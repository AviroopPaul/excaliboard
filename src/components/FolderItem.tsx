import { Folder as FolderIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Folder } from "../lib/db";

interface FolderItemProps {
  folder: Folder;
}

export function FolderItem({ folder }: FolderItemProps) {
  return (
    <Link
      to={`/folder/${folder.id}`}
      className="flex flex-col items-center p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer group aspect-square justify-center"
    >
      <FolderIcon className="w-12 h-12 text-blue-400 group-hover:text-blue-600 transition-colors" />
      <span className="mt-3 text-sm font-medium text-gray-700 truncate w-full text-center select-none">
        {folder.name}
      </span>
    </Link>
  );
}
