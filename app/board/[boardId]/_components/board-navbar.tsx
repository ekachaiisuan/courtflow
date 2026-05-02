import { Board } from "@/db/schema";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { BoardNameForm } from "./board-name-form";
import { BoardOptions } from "./board-options";

interface BoardNavbarProps {
  board: Board ;
}

export const BoardNavbar = ({ board }: BoardNavbarProps) => {
  
  return (
  <div className="bg-blue-300 flex gap-x-4 h-14 items-center pl-4 pr-6 rounded-md text-white w-full">
    <div className="flex gap-x-2 items-center">
      <Link href="/dashboard">
        <ChevronLeftIcon className="size-4" />
      </Link>
        <BoardNameForm board={board} />
    </div>
    <div className="ml-auto">
        <BoardOptions id={board.id} />
      </div>
    </div>
  );
};
