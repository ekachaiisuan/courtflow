import React from "react";
interface CardContainerProps {
    children: React.ReactNode;
}

export const CardContainer = ({ children }: CardContainerProps) =>(
    <div className="flex flex-col gap-y-2">
        {children}
    </div>
)