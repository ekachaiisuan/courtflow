// app/workspaces/page.tsx
import { authIsRequired } from '@/server/user';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LayoutGrid } from 'lucide-react';
import { count, eq } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { WorkspaceRow } from './_components/workspace-row';
import { CreateWorkspace } from './_components/create-workspace';

import { db } from '@/db/drizzle';
import { workspaceMembers } from '@/db/schema';

export default async function WorkspacesPage() {
  await authIsRequired();
  const isHeaders = await headers();

  const hasPermission = await auth.api.userHasPermission({
    headers: isHeaders,
    body: {
      permission: { workspace: ['member-manage'] },
    },
  });

  if (!hasPermission.success) {
    redirect('/dashboard');
  }

  const [workspaceRows, memberCounts, owners] = await Promise.all([
    db.query.workspaces.findMany({
      orderBy: (workspace, { desc }) => [desc(workspace.createdAt)],
    }),
    db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        memberCount: count(),
      })
      .from(workspaceMembers)
      .groupBy(workspaceMembers.workspaceId),
    db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.role, 'owner'),
      with: {
        user: true,
      },
    }),
  ]);

  const memberCountByWorkspaceId = new Map(
    memberCounts.map((row) => [row.workspaceId, row.memberCount]),
  );
  const ownerByWorkspaceId = new Map(
    owners.map((owner) => [owner.workspaceId, owner.user]),
  );
  const workspaceList = workspaceRows.map((workspace) => ({
    ...workspace,
    memberCount: memberCountByWorkspaceId.get(workspace.id) ?? 0,
    ownerName: ownerByWorkspaceId.get(workspace.id)?.name ?? 'No owner',
  }));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Office Management Platform
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Workspace Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-col gap-4 mx-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <CardTitle className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5" />
                    Workspaces ({workspaceList.length})
                  </CardTitle>
                  <CardDescription>
                    Manage workspaces and their members
                  </CardDescription>
                </div>
                <CreateWorkspace />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-25">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspaceList.map((workspace) => (
                      <WorkspaceRow key={workspace.id} workspace={workspace} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
