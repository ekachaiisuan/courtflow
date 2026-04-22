import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
interface FormSubmitProps {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary";
}

export const FormSubmit = ({ children,className,variant,disabled }: FormSubmitProps) => (
    <Button className={cn("w-full", className)} disabled={disabled} type="submit" variant={variant} >{children}</Button>
)