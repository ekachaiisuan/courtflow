import { cn } from "@/lib/utils";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef } from "react";

interface EmptyDropZoneProps {
  isDropTarget: boolean;
  isVisible: boolean;
}

export const EmptyDropZone = ({
  isDropTarget,
  isVisible,
}: EmptyDropZoneProps) =>
  isVisible ? (
    <div
      className={cn(
        "border-2 border-dashed duration-200 flex items-center justify-center min-h-20 mx-2 my-4 rounded-lg transition-all",
        isDropTarget
          ? "bg-blue-50 border-blue-500"
          : "bg-gray-50 border-gray-300",
      )}
    >
      <div
        className={cn(
          "font-medium text-sm",
          isDropTarget ? "text-blue-600" : "text-gray-500",
        )}
      >
        Drop Card here
      </div>
    </div>
  ) : null;
