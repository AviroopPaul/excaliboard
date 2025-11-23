import { FileEdit } from "lucide-react";
import { Link } from "react-router-dom";
import type { Board } from "../lib/db";
import { formatDistanceToNow } from "date-fns";

interface BoardItemProps {
  board: Board;
}

export function BoardItem({ board }: BoardItemProps) {
  return (
    <Link
      to={`/board/${board.id}`}
      className="flex flex-col p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer group aspect-square justify-between"
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
  );
}
