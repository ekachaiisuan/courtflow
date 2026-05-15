"use client";

import { useEffect, useRef } from "react";
import { BoardActionLog, ListWithCards } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CardItem } from "./card-item";
import { CardSlot } from "./card-slot";
import { DragSate } from "@/lib/drag-types";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { EmptyDropZone } from "./empty-drop-zone";
import { CARD_GAP } from "@/lib/constants";
import { PulsingCard } from "./pulsing-card";

interface PendingCard {
  id: string;
  name: string;
}

interface CardContainerProps {
  dragState: DragSate;
  listWithCards: ListWithCards;
  logs: BoardActionLog[];
  pendingCards: PendingCard[];
  userImage: string;
  userName: string;
}

export const CardContainer = ({
  dragState,
  listWithCards,
  logs,
  pendingCards,
  userImage,
  userName,
}: CardContainerProps) => {
  const cardRef = useRef<HTMLOListElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const shouldShiftCard = (index: number) => {
    if (
      dragState.placeholderListId !== listWithCards.id ||
      dragState.placeholderIndex === null
    )
      return false;
    return index >= dragState.placeholderIndex;
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    let cleanup: (() => void) | undefined;
    const timeoutId = setTimeout(() => {
      if (scrollArea.scrollHeight <= scrollArea.clientHeight) return;
      cleanup = autoScrollForElements({
        canScroll: ({ source }) => source.data.type === "card",
        element: scrollArea,
        getConfiguration: () => ({
          maxScrollSpeed: "standard",
        }),
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanup?.();
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea
        className="flex-1 overflow-y-auto pb-1 rounded-md"
        ref={scrollAreaRef}
      >
        {/** TODO: add empty list drop zone here */}
        <EmptyDropZone
          isDropTarget={dragState.draggedItem?.listId === listWithCards.id}
          isVisible={
            dragState.isDragging &&
            dragState.draggedItem?.type === "card" &&
            listWithCards.cards.length === 0
          }
        />

        <ol
          className={cn(
            "flex flex-col gap-y-2 px-1",
            listWithCards.cards.length > 0 ? "mt-2" : "mt-0",
          )}
          ref={cardRef}
        >
          {listWithCards.cards.map((card, index) => (
            <CardSlot
              cardId={card.id}
              index={index}
              key={card.id}
              listId={listWithCards.id}
            >
              <CardItem
                cardWithList={{ ...card, list: listWithCards }}
                hidden={dragState.draggedItem?.id === card.id}
                image={userImage}
                index={index}
                logs={logs}
                name={card.name}
                shiftDown={shouldShiftCard(index)}
                userName={userName}
              />
            </CardSlot>
          ))}
          {pendingCards.map((card) => (
            <PulsingCard key={card.id} name={card.name} />
          ))}
        </ol>
        {dragState.placeholderListId === listWithCards.id &&
        dragState.placeholderIndex !== null ? (
          <div style={{ height: CARD_GAP }} />
        ) : null}
      </ScrollArea>
    </div>
  );
};
