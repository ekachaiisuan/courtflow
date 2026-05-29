'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Kanban,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Spinner } from './ui/spinner';

// This is sample data.
const data = {
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Users',
      url: '/admin',
      icon: Users,
    },
  ],
  projects: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: Kanban,
    },
  ],
  workspaces: [
    {
      name: 'workspaces',
      url: '/workspaces',
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [permissions, setPermissions] = useState({
    hasAdminPermission: false,
    canManageWorkspace: false,
  });
  const { data: session, isPending: loading } = authClient.useSession();

  useEffect(() => {
    if (!session) return;

    Promise.all([
      authClient.admin.hasPermission({ permission: { user: ['list'] } }),
      authClient.admin.hasPermission({
        permission: { workspace: ['member-manage'] },
      }),
    ]).then(([{ data: adminData }, { data: workspaceData }]) => {
      setPermissions({
        hasAdminPermission: adminData?.success ?? false,
        canManageWorkspace: workspaceData?.success ?? false,
      });
    });
  }, [session]);

  if (loading) {
    return (
      <div>
        <Spinner className="size-4" />
      </div>
    );
  }

  const user = {
    name: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    avatar: session?.user?.image ?? '/avatars/default.jpg',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {permissions.hasAdminPermission && <NavMain items={data.navMain} />}
        {permissions.canManageWorkspace && (
          <NavProjects
            projects={data.workspaces}
            label="Workspace management"
          />
        )}
        <NavProjects projects={data.projects} label="My boards" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
