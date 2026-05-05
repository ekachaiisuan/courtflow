import { BoardActionLog, ListWithCards } from "@/db/schema";
import { ListHeader } from "./list-header";
import { CardContainer } from "./card/card-container";
import { CardForm } from "./card/card-form";

interface ListContentsProps {
  listWithCards: ListWithCards;
  logs: BoardActionLog[];
  userImage: string;
  userName: string;
}

export const ListContents = ({  
  listWithCards,
  logs,
  userImage,
  userName,
}: ListContentsProps) => {
    

  return (
    <>
      <ListHeader 
        listWithCards={listWithCards}
        onAddCard={() => {}}
      />
      <CardContainer>
        <div className="shrink-0">
          <CardForm />
        </div>
      </CardContainer>
    </>
  );
};
