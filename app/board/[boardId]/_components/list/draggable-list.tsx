import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

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
