'use client';

import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef } from "react";

interface CardSlotProps {
    cardId: string;
    children: React.ReactNode;
    index: number;
    listId: string;
}

export const CardSlot = ({cardId, children, index, listId }: CardSlotProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        return dropTargetForElements({
            element,
            getData: ({element,input}) => {
                const data = {cardId, index, listId, type: "card"};
                return attachClosestEdge(data,{
                    allowedEdges: ["top","bottom"],
                    element,
                    input
                })
            },
        })
    }, [cardId, index, listId]);
    return (
        <div ref={ref}>
            {children}
        </div>
    )
}