// app/workspaces/page.tsx
import { authIsRequired } from '@/server/user';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
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

import type { workspaces } from '@/db/schema';

type Workspace = typeof workspaces.$inferSelect & { memberCount: number };

export const Workspaces: Workspace[] = [
  {
    id: '1',
    name: 'cccm6',
    memberCount: 12,
    createdBy: 'user_1',
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
  },
  {
    id: '2',
    name: 'account',
    memberCount: 5,
    createdBy: 'user_1',
    createdAt: new Date('2025-03-03'),
    updatedAt: new Date('2025-03-03'),
  },
  {
    id: '3',
    name: 'admin',
    memberCount: 8,
    createdBy: 'user_2',
    createdAt: new Date('2025-05-20'),
    updatedAt: new Date('2025-05-20'),
  },
];

export default async function WorkspacesPage() {
  const session = await authIsRequired();
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

  // TODO: fetch workspaces จาก tRPC หรือ db โดยตรง
  // const workspaces = await ...

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
                    Workspaces ({Workspaces.length})
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
                      <TableHead>Created By</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-25">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Workspaces.map((workspace) => (
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
