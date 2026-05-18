import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithList } from "@/db/schema";
import { useCardModal } from "@/hooks/use-card-modal";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, Trash } from "lucide-react";
import { toast } from "sonner";

interface ActionsProps {
  cardWithList: CardWithList;
}

export const Actions = ({ cardWithList }: ActionsProps) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const cardModal = useCardModal();

  const copyCard = useMutation(
    trpc.card.copyCard.mutationOptions({
      onError: (error) =>
        toast("Failed to copy card", {
          description: error.message,
        }),
      onSuccess: () => {
        cardModal.onClose();
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: cardWithList.list.boardId,
          }),
        });
      },
    }),
  );

  const deleteCard = useMutation(
    trpc.card.deleteCard.mutationOptions({
      onError: (error) =>
        toast("Failed to delete card", {
          description: error.message,
        }),
      onSuccess: () => {
        toast("Success!", {
          closeButton: true,
          description: "Card deleted successfully",
        });
        cardModal.onClose();
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: cardWithList.list.boardId,
          }),
        });
      },
    }),
  );

  const onCopy = () => copyCard.mutate({ cardId: cardWithList.id });
  const onDelete = () =>
    deleteCard.mutate({
      boardId: cardWithList.list.boardId,
      cardId: cardWithList.id,
      cardName: cardWithList.name,
      listId: cardWithList.listId,
    });

  return (
    <div className="mt-2 space-y-2">
      <p className="font-semibold text-xs">Actions</p>
      <Button
        className="justify-start w-full"
        disabled={copyCard.isPending || deleteCard.isPending}
        onClick={onDelete}
        size="inline"
        variant="destructive"
      >
        <Trash className="mr-2 size-4" />
        Delete
      </Button>
      <Button
        className="justify-start w-full"
        disabled={copyCard.isPending || deleteCard.isPending}
        onClick={onCopy}
        size="inline"
        variant="gray"
      >
        <CopyIcon className="mr-2 size-4"/>
        Copy
      </Button>
    </div>
  );
};

export const ActionsSkeleton = () =>(
    <div className="mt-2 space-y-2">
        <Skeleton className="bg-neutral-200 h-4 w-20"></Skeleton>
        <Skeleton className="bg-neutral-200 h-8 w-full"></Skeleton>
        <Skeleton className="bg-neutral-200 h-8 w-full"></Skeleton>
    </div>
)


