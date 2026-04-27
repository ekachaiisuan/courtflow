import { ListContainer } from "./list-container";

interface BoardIdPageContentsProps {
    boardId: string
}
export const BoardIdPageContents = ({ boardId }: BoardIdPageContentsProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:py-8 space-y-4">
        <ListContainer />
      </main>
    </div>
  );
};

export default BoardIdPageContents;