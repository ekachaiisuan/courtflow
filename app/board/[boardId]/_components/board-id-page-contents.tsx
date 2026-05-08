"use client";
import { useTRPC } from "@/trpc/client";
import { ListContainer } from "./list/list-container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BoardNavbar, BoardNavbarSkeleton } from "./board-navbar";
import { BoardSidebar } from "@/components/board-sidebar";

interface BoardIdPageContentsProps {
  boardId: string;
  userImage: string;
  userName: string;
}
export const BoardIdPageContents = ({
  boardId,
  userImage,
  userName,
}: BoardIdPageContentsProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.pages.boardIdPage.queryOptions({ boardId }),
  );

  const board = data.boards.find((board) => board.id === boardId);

  return board ? (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:py-8 space-y-4">
        <BoardNavbar board={board} />
        <ListContainer
          boardId={boardId}
          listWithCards={board.lists}
          logs={data.logs}
          userImage={userImage}
          userName={userName}
        />
      </main>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:py-8 space-y-4">
        <h1> Board not found</h1>
        <p className="text-muted-foreground text-sm">
          The board you are looking for does not exist.
        </p>
        <Button>
          <Link href="/dashboard">Go back</Link>
        </Button>
      </main>
    </div>
  );
};

export const BoardIdPageContentsSkeleton = () => (
  <div className="flex size-full">
    {/* <BoardSidebarSkeleton /> */}
    <div className="p-2 size-full">
      <div className="bg-white flex flex-col gap-2 p-2 rounded-md size-full">
        <BoardNavbarSkeleton />
      </div>
    </div>
  </div>
);

export default BoardIdPageContents;
