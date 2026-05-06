import React,{useRef} from "react";
import { Card } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CardItem } from "./card-item";
import { CardSlot } from "./card-slot";

interface CardContainerProps {
    cards: Card[];
}

export const CardContainer = ({ cards }: CardContainerProps) =>{
    const cardRef = useRef<HTMLOListElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <ScrollArea className="flex-1 overflow-y-auto pb-1 rounded-md" ref={scrollAreaRef}>
                <ol className={cn("flex flex-col gap-y-2 px-1", cards.length > 0 ? "mt-2" : "mt-0")} ref={cardRef} >
                    {cards.map((card, index) => (
                      <CardSlot key={card.id}>
                        <CardItem/>
                      </CardSlot>
                    ))}

                </ol>
            </ScrollArea>

        </div>
    )
}