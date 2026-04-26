import { Card, CardContent } from '@/components/ui/card';
import { Board } from '@/db/schema';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BoardCardProps {
  board: Board;
  mode?: 'grid' | 'list';
}
export const BoardCard = ({ board, mode = 'grid' }: BoardCardProps) => (
  <Link href={`/board/${board.id}`}>
    <Card className={cn(
      "bg-sky-200 rounded-sm transition-all hover:opacity-80",
      mode === 'grid' ? "aspect-video size-full" : "w-full h-auto py-2"
    )}>
      <CardContent className="p-2">
        <p className="font-semibold text-white">{board.name}</p>
      </CardContent>
    </Card>
  </Link>
);