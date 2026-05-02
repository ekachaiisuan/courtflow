"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, X } from "lucide-react";

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
      <PopoverContent align="start" className="px-0 py-3" side="bottom">
        <div className="font-medium pb-4 text-center text-neutral-600 text-sm">Board actions</div>
        <PopoverClose asChild>
          <Button className="absolute h-auto p-2 right-2 text-neutral-600 top-2 w-auto" variant="ghost">
            <X className="size-4" />

          </Button>
          </PopoverClose>
          <Button className="font-normal h-auto justify-start p-2 px-5 rounded-none text-sm w-full"
          disabled={deleteBoard.isPending}
          onClick={onDelete}
          variant="ghost">
            Delete board
          </Button>
      </PopoverContent>
    </Popover>
  );
};
