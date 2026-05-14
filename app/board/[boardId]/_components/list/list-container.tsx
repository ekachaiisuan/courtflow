import {
  BoardActionLog,
  Card,
  ListWithCards,
} from "@/db/schema/schedule";
import { ListItem } from "./list-item";
import { ListForm } from "./list-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useCallback, useEffect, useState } from "react";
import { DragData, DragSate } from "@/lib/drag-types";
import { toast } from "sonner";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

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
        toast("Failed to reorder cards", {
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
        toast("Failed to reorder lists", {
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

  const [orderedData, setOrderedData] =
    useState<ListWithCards[]>(listWithCards);

  useEffect(() => {
    setOrderedData(listWithCards);
  }, [listWithCards]);

  const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  function shapeCardToReorderCardInput(cards: Card[]) {
    return cards.map((card) => ({
      id: card.id,
      listId: card.listId,
      name: card.name,
      order: card.order,
    }));
  }

  const handleCardReorder = useCallback(
    (
      sourceCardIndex: number,
      sourceListId: string,
      targetCardIndex: number,
      targetListId: string,
    ) => {
      if (sourceCardIndex < 0 || targetCardIndex < 0) return;

      const snapshot = [...orderedData];
      const newOrderData = [...orderedData];
      const sourceList = newOrderData.find((list) => list.id === sourceListId);
      const destinationList = newOrderData.find(
        (list) => list.id === targetListId,
      );

      if (!sourceList || !destinationList) return;
      if (!sourceList.cards) sourceList.cards = [];
      if (!destinationList.cards) destinationList.cards = [];

      if (sourceCardIndex >= sourceList.cards.length) return;
      if (targetCardIndex > destinationList.cards.length) return;

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
        setOrderedData([...newOrderData]);
        reorderCards.mutate(
          {
            boardId,
            cardsToReorder: shapeCardToReorderCardInput(newCards),
          },
          {
            onError: () => setOrderedData(snapshot),
          },
        );
      } else {
        const sourceCardsCopy = [...sourceList.cards];
        const destinationCardsCopy = [...destinationList.cards];
        const [movedCard] = sourceCardsCopy.splice(sourceCardIndex, 1);
        const moveCardCopy = { ...movedCard, listId: targetListId };
        destinationCardsCopy.splice(targetCardIndex, 0, moveCardCopy);
        const newSourceCards = sourceCardsCopy.map((card, index) => ({
          ...card,
          order: index,
        }));

        const newDestinationCards = destinationCardsCopy.map((card, index) => ({
          ...card,
          order: index,
        }));
        sourceList.cards = newSourceCards;
        destinationList.cards = newDestinationCards;

        setOrderedData([...newOrderData]);

        const allCardsToReorder = [
          ...shapeCardToReorderCardInput(newSourceCards),
          ...shapeCardToReorderCardInput(newDestinationCards),
        ];

        reorderCards.mutate(
          {
            boardId,
            cardsToReorder: allCardsToReorder,
          },
          {
            onError: () => setOrderedData(snapshot),
          },
        );
      }
    },
    [boardId, orderedData, reorderCards],
  );

  const handleListReorder = useCallback(
    (sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) return;
      const snapshot = [...orderedData];
      const listsToReorder = reorder(orderedData, sourceIndex, targetIndex).map(
        (list, index) => ({
          ...list,
          order: index,
        }),
      );
      setOrderedData(listsToReorder);
      reorderLists.mutate(
        {
          boardId,
          listsToReorder,
        },
        {
          onError: () => setOrderedData(snapshot),
        },
      );
    },
    [boardId, orderedData, reorderLists],
  );

  function calculatePlaceholderPosition(
    closestEdge: string | null,
    orderedData: ListWithCards[],
    sourceData: DragData,
    targetData: DragData,
  ): {
    placeholderIndex: number | null;
    placeholderListId: string | null;
  } {
    if (sourceData.type !== "card")
      return {
        placeholderIndex: null,
        placeholderListId: null,
      };
    if (targetData.type === "card") {
      let placeholderIndex = targetData.index;
      if (closestEdge === "bottom") placeholderIndex++;
      return {
        placeholderIndex,
        placeholderListId: targetData.listId,
      };
    }
    if (targetData.type === "list") {
      const list = orderedData.find((list) => list.id === targetData.listId);
      const listCardCount = list?.cards.length ?? 0;
      return {
        placeholderIndex: listCardCount,
        placeholderListId: targetData.listId,
      };
    }
    return { placeholderIndex: null, placeholderListId: null };
  }

  useEffect(() => {
    return monitorForElements({
      onDragStart({ source }) {
        setDragState({
          draggedItem: {
            id:
              source.data.type === "card"
                ? (source.data.cardId as string)
                : (source.data.listId as string),
            index: source.data.index as number,
            listId: source.data.listId as string,
            type: source.data.type as "card" | "list",
          },
          isDragging: true,
          placeholderIndex: null,
          placeholderListId: null,
        });
      },
      onDrag({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          setDragState((prev) => ({
            ...prev,
            placeholderIndex: null,
            placeholderListId: null,
          }));
          return;
        }
        const closestEdge = extractClosestEdge(target.data);

        const { placeholderIndex, placeholderListId } =
          calculatePlaceholderPosition(
            closestEdge,
            orderedData,
            source.data as unknown as DragData,
            target.data as unknown as DragData,
          );
        setDragState((prev) => ({
          ...prev,
          placeholderIndex,
          placeholderListId,
        }));
      },
      onDrop({ location, source }) {
        setDragState({
          draggedItem: null,
          isDragging: false,
          placeholderIndex: null,
          placeholderListId: null,
        });
        const target = location.current.dropTargets[0];
        if (!target) return;
        const sourceData = source.data;
        const targetData = target.data;
        const closestEdge = extractClosestEdge(targetData);
        if (sourceData.type === "list") {
          const targetList = location.current.dropTargets.find(
            (t) => t.data.type === "list",
          );
          if (!targetList || sourceData.index === undefined) return;
          const sourceIndex = sourceData.index as number;
          const targetIndex = targetList.data.index as number;
          if (sourceIndex === targetIndex) return;
          handleListReorder(sourceIndex, targetIndex);
          return;
        }
        if (sourceData.type === "card") {
          const sourceListId = sourceData.listId as string;
          const sourceCardIndex = sourceData.index as number;
          if (sourceCardIndex === undefined) return;
          if (targetData.type === "card") {
            const targetListId = targetData.listId as string;
            let targetCardIndex = targetData.index as number;
            if (closestEdge === "bottom") targetCardIndex++;
            if (
              sourceListId === targetListId &&
              sourceCardIndex < targetCardIndex
            )
              targetCardIndex--;
            handleCardReorder(
              sourceCardIndex,
              sourceListId,
              targetCardIndex,
              targetListId,
            );
            return;
          }
          const targetList = location.current.dropTargets.find(
            (t) => t.data.type === "list",
          );
          if (targetList) {
            const targetListId = targetList.data.listId as string;
            const list = orderedData.find((list) => list.id === targetListId);
            const targetCardIndex = list?.cards.length ?? 0;
            handleCardReorder(
              sourceCardIndex,
              sourceListId,
              targetCardIndex,
              targetListId,
            );
          }
        }
      },
    });
  }, [handleCardReorder, handleListReorder, orderedData]);

  return (
    <div className="h-full overflow-x-auto">
      <ol className="flex gap-x-3 h-full pb-2">
        {/*TODO: Add all the lists here*/}
        {orderedData.map((list, index) => (
          <ListItem
            dragState={dragState}
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
