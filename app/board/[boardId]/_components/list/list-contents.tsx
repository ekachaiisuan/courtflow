"use client";

import { BoardActionLog, ListWithCards } from "@/db/schema";
import { ListHeader } from "./list-header";
import { CardContainer } from "./card/card-container";
import { CardForm } from "./card/card-form";
import { useRef, useState } from "react";
import { DragSate } from "@/lib/drag-types";

interface ListContentsProps {
  dragState: DragSate;
  listWithCards: ListWithCards;
  logs: BoardActionLog[];
  userImage: string;
  userName: string;
}

interface PendingCard {
  id: string;
  name: string;
}

export const ListContents = ({
  dragState,
  listWithCards,
  logs,
  userImage,
  userName,
}: ListContentsProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingCards,setPendingCards] = useState<PendingCard[]>([]);

  const disableEditing = () => setIsEditing(false);
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => textAreaRef.current?.focus());
  }

  const addPendingCard = (name: string) => {
    const pendingId = `pending-${Date.now()}`;
    setPendingCards([...pendingCards,{id: pendingId,name}]);
    return pendingId;
  }

  const removePendingCard = (id: string) => setPendingCards(pendingCards.filter(card => card.id !== id));

  return (
    <>
      <ListHeader listWithCards={listWithCards} onAddCard={enableEditing} />
      <CardContainer
        dragState={dragState}
        listWithCards={listWithCards}
        logs={logs}
        pendingCards={pendingCards}
        userImage={userImage}
        userName={userName}
      />
      <div className="shrink-0">
        <CardForm
          addPendingCard={addPendingCard}
          disableEditing={disableEditing}
          enableEditing={enableEditing}
          isEditing={isEditing}
          listId={listWithCards.id}
          ref={textAreaRef}
          removePendingCard={removePendingCard}
          />
      </div>
    </>
  );
};
