// app/workspaces/_components/workspace-row.tsx
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { workspaces } from '@/db/schema';

type Workspace = typeof workspaces.$inferSelect & {
  memberCount: number;
  ownerName: string;
};

type WorkspaceRowProps = {
  workspace: Workspace;
};

export function WorkspaceRow({ workspace }: WorkspaceRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{workspace.name}</TableCell>
      <TableCell className="font-medium">{workspace.ownerName}</TableCell>
      <TableCell>{workspace.memberCount}</TableCell>
      <TableCell className="text-muted-foreground">
        {workspace.createdAt.toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/workspaces/${workspace.id}/members`}>
              <Users className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/workspaces/${workspace.id}/settings`}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
