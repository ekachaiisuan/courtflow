"use client";

import { useRef } from "react";
import { BoardActionLog, ListWithCards } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CardItem } from "./card-item";
import { CardSlot } from "./card-slot";

interface PendingCard {
  id: string;
  name: string;
}

interface CardContainerProps {
  listWithCards: ListWithCards;
  logs: BoardActionLog[];
  pendingCards: PendingCard[];
  userImage: string;
}

export const CardContainer = ({
  listWithCards,
  logs,
  pendingCards,
  userImage,
}: CardContainerProps) => {
  const cardRef = useRef<HTMLOListElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea
        className="flex-1 overflow-y-auto pb-1 rounded-md"
        ref={scrollAreaRef}
      >
        <ol
          className={cn(
            "flex flex-col gap-y-2 px-1",
            listWithCards.cards.length > 0 ? "mt-2" : "mt-0",
          )}
          ref={cardRef}
        >
          {listWithCards.cards.map((card, index) => (
            <CardSlot key={card.id}>
              <CardItem
              cardWithList={{ ...card, list: listWithCards }}
              hidden={false} // TODO: add after we have drag and drop
              image={userImage}
              logs={logs}
              name={card.name}
              shiftDown= {false} // TODO: add after we have drag and drop
               />
            </CardSlot>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
};
