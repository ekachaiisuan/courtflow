'use client'
import { useTRPC } from "@/trpc/client";
import { ListContainer } from "./list-container";
import { useSuspenseQuery } from "@tanstack/react-query";

interface BoardIdPageContentsProps {
    boardId: string
}
export const BoardIdPageContents = ({ boardId }: BoardIdPageContentsProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.pages.boardIdPage.queryOptions({ boardId }),
  );

  const board = data.boards.find(board=> board.id === boardId);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:py-8 space-y-4">
        <ListContainer />
      </main>
    </div>
  );
};

export default BoardIdPageContents;