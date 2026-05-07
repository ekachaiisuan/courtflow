import { BoardActionLog, CardWithList } from "@/db/schema";
import { CARD_GAP, LONG_WORD_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface CardItemProps {
  cardWithList: CardWithList;
  hidden?: boolean;
  image: string;
  logs: BoardActionLog[];
  name: string;
  shiftDown: boolean;
}
export const CardItem = ({
  cardWithList,
  hidden,
  image,
  logs,
  name,
  shiftDown = false,
}: CardItemProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState();
  const hasLongWord = cardWithList.name
    .split(" ")
    .some((word) => word.length > LONG_WORD_THRESHOLD);

  return (
    <div className="relative">
      <div
        className={cn(
          "active:cursor-grabbing bg-white border-2 border-transparent cursor-grab duration-150 hover:border-black overflow-hidden rounded-md text-sm transition-all",
          hasLongWord ? "break-all" : isDragging && "opacity-50",
        )}
        ref={cardRef}
        role="button"
        style={{
          opacity: hidden ? 0 : undefined,
          pointerEvents: hidden ? "none" : undefined,
          transform: shiftDown ? `translateY(${CARD_GAP})` : undefined,
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
