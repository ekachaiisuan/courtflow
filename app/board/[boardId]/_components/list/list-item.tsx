import { BoardActionLog, ListWithCards } from "@/db/schema";
import { ListContents } from "./list-contents"

interface ListItemProps {
    index: number;
    listWithCards: ListWithCards;
    logs: BoardActionLog[];
    userImage: string;
    userName: string;
}


export const ListItem = ({ index, listWithCards, logs, userImage, userName }: ListItemProps) => {
    //TODO:add drag and drop functionality here
    return (
        <ListContents
            listWithCards={listWithCards}
            logs={logs}
            userImage={userImage}
            userName={userName}
        />
    );
};
