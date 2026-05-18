'use client';

import { BoardActionLog, CardWithList } from "@/db/schema";
import { useCardModal } from "@/hooks/use-card-modal";
import { CARD_GAP, LONG_WORD_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";

interface CardItemProps {
  cardWithList: CardWithList;
  hidden?: boolean;
  image: string;
  index: number;
  logs: BoardActionLog[];
  name: string;
  shiftDown: boolean;
  userName: string;
}
export const CardItem = ({
  cardWithList,
  hidden = false,
  image,
  index,
  logs,
  name,
  shiftDown = false,
  userName,
}: CardItemProps) => {
  const {onOpen} = useCardModal();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasLongWord = cardWithList.name
    .split(" ")
    .some((word) => word.length > LONG_WORD_THRESHOLD);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    return combine(
      draggable({
        element,
        getInitialData: () => ({
          cardId: cardWithList.id,
          index,
          listId: cardWithList.listId,
          userName,
          type: "card",
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
    );
  },[cardWithList.id, cardWithList.listId, index]);

  return (
    <div className="relative">
      <div
        className={cn(
          "active:cursor-grabbing bg-white border-2 border-transparent cursor-grab duration-150 hover:border-black overflow-hidden rounded-md text-sm transition-all",
          hasLongWord ? "break-all" : "wrap-break hyphens-auto", isDragging && "opacity-50",
        )}
        onClick={() => onOpen(cardWithList, image, logs.filter((log) => log.boardComponentId === cardWithList.id), name)}
        ref={cardRef}
        role="button"
        style={{
          opacity: hidden ? 0 : undefined,
          pointerEvents: hidden ? "none" : undefined,
          transform: shiftDown ? `translateY(${CARD_GAP}px)` : undefined,
          transition: "transform 150ms ease",
          visibility: hidden ? "hidden" : undefined,
        }}
        tabIndex={0}
      >
        <div className="px-3 py-2">
          <p className="text-gray-700 text-sm">{name}</p>
        </div>
      </div>
    </div>
  );
};
