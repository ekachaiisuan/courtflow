interface CardSlotProps {
    children: React.ReactNode;
}

export const CardSlot = ({ children }: CardSlotProps) => {
    return (
        <div>
            {children}
        </div>
    )
}