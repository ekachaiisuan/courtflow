"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Popover, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { MoreHorizontalIcon } from "lucide-react";

interface BoardOptionsProps {
  id: string;
}

export const BoardOptions = ({ id }: BoardOptionsProps) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const router = useRouter();
  const deleteBoard = useMutation(
    trpc.board.deleteBoard.mutationOptions({
      onError: (error) =>
        toast("Error deleting board", {
          description: error.message,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardPage.queryKey(),
        });
        router.push("/dashboard");
      },
    }),
  );
  const onDelete = () => deleteBoard.mutate({ boardId: id });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto p-2 w-auto" variant="transparent">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </PopoverTrigger>
    </Popover>
  );
};
