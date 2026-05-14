"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";


interface DraggableListProps {
  children: React.ReactNode;
  index: number;
  listId: string;
}
export const DraggableList = ({
  children,
  index,
  listId,
}: DraggableListProps) => {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLLIElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const dragHandle = dragHandleRef.current;
    const element = listRef.current;
    if (!dragHandle || !element) return;
    return combine(
      draggable({
        element: dragHandle,
        getInitialData: () => ({
          index,
          listId,
          type: "list",
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: () => ({
          index,
          listId,
          type: "list",
        }),
      }),
    );
  },[index, listId]);
  return (
    <li
      className={cn(
        "h-full select-none shrink-0 w-68",
        isDragging && "opacity-50",
      )}
      ref={listRef}
    >
      <div
        className={cn(
          "active:cursor-grabbing bg-[#f1f2f4] cursor-grab flex flex-col rounded-md shadow-md",
          isDragging && "ring-2 ring-blue-500",
        )}
        ref={dragHandleRef}
        style={{ maxHeight: "calc(100vh - 180px)" }}
      >
        {children}
      </div>
    </li>
  );
};
