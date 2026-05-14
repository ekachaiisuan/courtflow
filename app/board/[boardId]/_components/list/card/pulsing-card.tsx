import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PulsingCardProps {
  name: string;
}
export const PulsingCard = ({ name }: PulsingCardProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="animate-pulse bg-white border-2 border-transparent wrap-break-words hyphens-auto opacity-70 px-3 py-2 rounded-md shadow-sm text-sm">
        {name}
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p>Creating... Please wait!</p>
    </TooltipContent>
  </Tooltip>
);
