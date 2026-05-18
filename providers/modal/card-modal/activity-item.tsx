import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BoardActionLog } from "@/db/schema";

interface ActivityItemsProps {
  image: string | null;
  name: string | null;
  log: BoardActionLog;
}

export const ActivityItem = ({ image, name, log }: ActivityItemsProps) => {
  const generateLogMessage = (log: BoardActionLog) => {
    const { action, boardComponent, boardComponentName } = log;

    switch (action) {
      case "CREATE":
        return `Created ${boardComponent.toLowerCase()} ${boardComponentName}`;
      case "UPDATE":
        return `Updated ${boardComponent.toLowerCase()} ${boardComponentName}`;
      case "DELETE":
        return `Deleted ${boardComponent.toLowerCase()} ${boardComponentName}`;
      default:
        return `did unkhnown action for ${boardComponent.toLowerCase()} ${boardComponentName}`;
    }
  };
  return (
    <li className="flex gap-x-2 items-center">
      {image !== null ? (
        <Avatar className="size-8">
          <AvatarImage alt="User avatar" src={image} />
          <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      ) : null}
      <div className="flex flex-col space-y-0.5">
        <p className="text-muted-foreground text-sm">
          <span className="font-semibold text-neutral-700">
            {name ?? "Unkhown User"}
          </span>
          {generateLogMessage(log)}
        </p>
        <p className="text-muted-foreground text-xs">
          {log.createdAt.toLocaleString()}
        </p>
      </div>
    </li>
  );
};
