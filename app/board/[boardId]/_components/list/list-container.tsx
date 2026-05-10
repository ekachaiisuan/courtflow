import {
  BoardActionLog,
  Card,
  list,
  ListWithCards,
} from '@/db/schema/schedule';
import { ListItem } from './list-item';
import { ListForm } from './list-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useState } from 'react';
import { DragSate } from '@/lib/drag-types';
import { toast } from 'sonner';
import { set } from 'zod';

interface ListContainerProps {
  boardId: string;
  listWithCards: ListWithCards[];
  logs: BoardActionLog[];
  userImage: string;
  userName: string;
}

export const ListContainer = ({
  boardId,
  listWithCards,
  logs,
  userImage,
  userName,
}: ListContainerProps) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const reorderCards = useMutation(
    trpc.card.reorderCards.mutationOptions({
      onError: (error) =>
        toast('Failed to reorder cards', {
          description: error.message,
        }),
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({ boardId }),
        }),
    }),
  );
  const reorderLists = useMutation(
    trpc.list.reorderLists.mutationOptions({
      onError: (error) =>
        toast('Failed to reorder lists', {
          description: error.message,
        }),
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({ boardId }),
        }),
    }),
  );
  const [dragState, setDragState] = useState<DragSate>({
    draggedItem: null,
    isDragging: false,
    placeholderIndex: null,
    placeholderListId: null,
  });

  const [orderdData, setOrderdData] = useState<ListWithCards[]>(listWithCards);

  const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleCardReorder = (
    sourceCardIndex: number,
    sourceListId: string,
    targetCardIndex: number,
    targetListId: string,
  ) => {
    if (sourceCardIndex < 0 || targetCardIndex < 0) return;
    if (sourceListId === targetListId) return;

    const snapshot = [...orderdData];
    const newOrderData = [...orderdData];
    const sourceList = newOrderData.find((list) => list.id === sourceListId);
    const destinationList = newOrderData.find(
      (list) => list.id === targetListId,
    );

    if (!sourceList || !destinationList) return;
    if (!sourceList.cards) sourceList.cards = [];
    if (!destinationList.cards) destinationList.cards = [];

    if (sourceCardIndex >= sourceList.cards.length) return;
    if (targetCardIndex >= destinationList.cards.length) return;

    if (sourceListId === targetListId) {
      if (sourceCardIndex === targetCardIndex) return;
      const cardsCopy = [...sourceList.cards];
      const reorderedCards = reorder(
        cardsCopy,
        sourceCardIndex,
        targetCardIndex,
      );
      const newCards = reorderedCards.map((card, index) => ({
        ...card,
        order: index,
      }));
      sourceList.cards = newCards;
      setOrderdData([...newOrderData]);
      reorderCards.mutate(
        {
          boardId,
          cardsToReorder: shapeCardToReorderCardInput(newCards),
        },
        {},
      );
    }
  };

  const shapeCardToReorderCardInput = (cards: Card[]) =>
    cards.map((card) => ({
      id: card.id,
      listId: card.listId,
      name: card.name,
      order: card.order,
    }));

  return (
    <div className="h-full overflow-x-auto">
      <ol className="flex gap-x-3 h-full pb-2">
        {/*TODO: Add all the lists here*/}
        {listWithCards.map((list, index) => (
          <ListItem
            key={list.id}
            index={index}
            listWithCards={list}
            logs={logs}
            userImage={userImage}
            userName={userName}
          />
        ))}
        <ListForm />
        <div className="shrink-0 w-1"></div>
      </ol>
    </div>
  );
};
