"use client";
import { useTRPC } from "@/trpc/client";
import { ListContainer } from "./list-container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BoardIdPageContentsProps {
  boardId: string;
}
export const BoardIdPageContents = ({ boardId }: BoardIdPageContentsProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.pages.boardIdPage.queryOptions({ boardId }),
  );

  const board = data.boards.find((board) => board.id === boardId);

  return board ? (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:py-8 space-y-4">
        <ListContainer />
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

export default BoardIdPageContents;
