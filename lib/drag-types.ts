export interface CardDragData {
  cardId: string;
  index: number;
  listId: string;
  type: "card";
}

export interface ListDragData {
  listId: string;
  index: number;
  type: "list";
}

export type DragData = CardDragData | ListDragData;

export interface DragSate {
  draggedItem: {
    id: string;
    index?: number;
    listId?: string;
    type: "card" | "list";
  } | null;
  isDragging: boolean;
  placeholderIndex: number | null;
  placeholderListId: string | null;
}

