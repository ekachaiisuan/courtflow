import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BoardActionLog } from "@/db/schema";
import { cn } from "@/lib/utils";
import { ActivityIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { ActivityItem } from "./activity-item";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityProps {
  image: string | null;
  name: string | null;
  logs: BoardActionLog[];
}

export const Activity = ({ image, name, logs }: ActivityProps) => {
  const [show, setShow] = useState(true);
  return (
    <div className="flex gap-x-3 items-start w-full">
      <div className="w-full">
        <div className="flex items-center mb-2">
          <ActivityIcon className="mr-2 size-5 text-neutral-700" />
          <p className="font-semibold text-neutral-700">Activity</p>
          <Button onClick={() => setShow(!show)} variant="ghost">
            {show ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </Button>
        </div>
        <div className={cn("w-full", { hidden: !show })}>
          <ScrollArea className="max-h-[25vh overflow-y-auto] pr-2">
            <ol className="mt-2 space-y-4">
              {logs.map((log) => (
                <ActivityItem
                  image={image}
                  key={log.id}
                  name={name}
                  log={log}
                />
              ))}
            </ol>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export const ActivitySkeleton = () => (
  <div className="flex gap-x-3 items-start w-full">
    <Skeleton className="bg-neutral-200 size-6"></Skeleton>
    <div className="w-full">
      <Skeleton className="bg-neutral-200 h-6 mb-2 w-24"></Skeleton>
      <Skeleton className="bg-neutral-200 h-10 w-full"></Skeleton>
    </div>
  </div>
);
