import { Board } from "@/db/schema";

interface BoardListProps {
  boards: Board[];
  currentBoardId: string;
}
export const BoardList = ({ boards, currentBoardId }: BoardListProps) =>
  boards.map((board) => {
    
  });
