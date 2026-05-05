import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListWithCards } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRef } from "react";
import { toast } from "sonner";
interface ListOptionsProps {
  listWithCards: ListWithCards;
  onAddCard: () => void;
}

export const ListOptions = ({ listWithCards, onAddCard }: ListOptionsProps) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const copyList = useMutation(
    trpc.list.copyList.mutationOptions({
      onError: (error) =>
        toast("Error copying list", {
          description: error.message,
        }),
      onSuccess: () => {
        closeRef.current?.click();
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: listWithCards.boardId,
          }),
        });
      },
    }),
  );
  const deleteList = useMutation(
    trpc.list.deleteList.mutationOptions({
      onError: (error) =>
        toast("Failed to delete list", {
          description: error.message,
        }),
      onSuccess: () => {
        closeRef.current?.click();
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: listWithCards.boardId,
          }),
        });
      },
    }),
  );

  const closeRef = useRef<HTMLButtonElement>(null);
  const onCopy = () => {
    copyList.mutate({
      boardId: listWithCards.boardId,
      id: listWithCards.id,
    });
  };

  const onDelete = () =>
    deleteList.mutate({
      boardId: listWithCards.boardId,
      id: listWithCards.id,
    });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto p-2 w-auto" variant="ghost">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="px-0 py-3" side="bottom">
        <div className="font-medium pb-4 text-center text-neutral-600 text-sm">
          List Actions
        </div>
        <PopoverClose asChild ref={closeRef}>
          <Button
            className="absolute h-auto p-2 right-2 text-neutral-600 top-2 w-auto"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </PopoverClose>
        <Button
          className="font-normal h-auto justify-start p-2 px-5 rounded-none text-sm w-full"
          onClick={onAddCard}
          variant="ghost"
        >
          <PlusIcon className="size-4" />
          Add Card
        </Button>
        <Button
          className="font-normal h-auto justify-start p-2 px-5 rounded-none text-sm w-full"
          disabled={copyList.isPending || deleteList.isPending}
          onClick={onCopy}
          variant="ghost"
        >
          <CopyIcon className="size-4" />
          Duplicate List
        </Button>
        <Separator />
        <Button
          className="font-normal h-auto justify-start p-2 px-5 rounded-none text-sm w-full"
          disabled={copyList.isPending || deleteList.isPending}
          onClick={onDelete}
          variant="ghost"
        >
          <TrashIcon className="size-4" />
          Delete List
        </Button>
      </PopoverContent>
    </Popover>
  );
};
