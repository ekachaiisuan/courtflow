import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authIsRequired } from "@/server/user";
import { BoardIdPageContents } from "./_components/board-id-page-contents";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "@/components/error-state";
import { Suspense } from "react";

interface BoardIdPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function Page({ params }: BoardIdPageProps) {
  await authIsRequired();
  const boardId = (await params).boardId;
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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{boardId}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <ErrorBoundary fallback={<ErrorState />}>
          <Suspense fallback={<div>Loading...</div>}>
            <BoardIdPageContents boardId={boardId} />
          </Suspense>
        </ErrorBoundary>
      </SidebarInset>
    </SidebarProvider>
  );
}
