import React from "react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "../ui/button";
import { X } from "lucide-react";
interface FormPopoverProps {
  align?: "start" | "end" | "center";
  children: React.ReactNode;
  disabled?: boolean;
  disableMessage?: string;
  formContent: React.ReactNode;
  prompt: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export const FormPopover = ({
  align,
  children,
  disabled,
  disableMessage="limited create when using free plan",
  formContent,
  prompt,
  side="bottom",
  sideOffset=0,
  open,
  onOpenChange,
}: FormPopoverProps) => {
    const closeRef = React.useRef<HTMLButtonElement>(null);
    return disabled ? (
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            {children}
          </PopoverTrigger>
          <PopoverContent align={align} side={side} sideOffset={sideOffset} className="pt-3 w-80">
            <div className="font-medium text-center text-rose-600 text-sm">
                {disableMessage}
            </div>
          </PopoverContent>
        </Popover>
    ) : (
            <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            {children}
          </PopoverTrigger>
          <PopoverContent align={align} side={side} sideOffset={sideOffset} className="pt-3 w-80">
            <div className="font-medium pb-4 text-center text-neutral-600 text-sm">
                {prompt}
            </div>
            <PopoverClose asChild ref={closeRef}>
                <Button className="absolute h-auto p-2 right-2 text-neutral-600 top-2 w-auto" variant="ghost">
                    <X className="size-4"/>
                </Button>
            </PopoverClose>
            {formContent}
          </PopoverContent>
        </Popover>
    )
} 