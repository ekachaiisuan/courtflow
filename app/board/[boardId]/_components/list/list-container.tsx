import { BoardActionLog, ListWithCards } from "@/db/schema/schedule";
import { ListItem } from "./list-item";
import { ListForm } from "./list-form";

interface ListContainerProps {
  boardId: string;
  listWithCards: ListWithCards[];
  logs: BoardActionLog[];
  userImage: string;
  userName: string;
}

export const ListContainer = ({
  boardId,
  listWithCards,
  logs,
  userImage,
  userName,
}: ListContainerProps) => {
  return (
    <div className="h-full overflow-x-auto">
      <ol className="flex gap-x-3 h-full pb-2">
        {/*TODO: Add all the lists here*/}
        {listWithCards.map((list, index) => (
          <ListItem
            key={list.id}
            index={index}
            listWithCards={list}
            logs={logs}
            userImage={userImage}
            userName={userName}
          />
        ))}
        <ListForm />
        <div className="shrink-0 w-1"></div>
      </ol>
    </div>
  );
};
