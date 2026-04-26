import { Board } from '@/db/schema';
import { BoardCard } from './board-card';

interface BoardListProps {
  boards: Board[];
  mode?: 'grid' | 'list';
}
export const BoardList = ({ boards, mode = 'grid' }: BoardListProps) =>
  mode === 'grid' ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} mode={mode} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col w-full gap-4 h-auto">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} mode={mode} />
      ))}
    </div>
  );
