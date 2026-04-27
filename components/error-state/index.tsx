import { cn } from "@/lib/utils"
import { AlertTriangleIcon } from "lucide-react"

interface ErrorStateProps {
    actionText?: string
    children?: React.ReactNode
    className?: string
    error?: Error
    message?: string
    onAction?: () => void
    showDetails?: boolean
    title?: string
}

export const ErrorState = ({
    actionText="Try again",
    children,
    className,
    error,
    message="Something went wrong",
    onAction=()=>window.location.reload(),
    showDetails=false,
    title="Something went wrong",
}: ErrorStateProps) => (
<div className="flex size-full">
<div className="p-2 size-full">
    <div className={cn("bg-background flex flex-col item-center justify-center p-4 rounded-md size-full text-center", className)}>
        <div className="max-w-md space-y-6">
            <div className="flex justify-center">
                <div className="bg-destructive/10 p-3 rounded-full">
                <AlertTriangleIcon className="size-10 text-destructive" />
                </div>
            </div>
        </div>
    </div>
</div>
</div>
)