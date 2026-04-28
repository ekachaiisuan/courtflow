'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
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
      icon: Bot,
    },
  ],
  projects: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: Frame,
    },

  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [hasAdminPermission, setHasAdminPermission] = useState(false);
  const { data: session, isPending: loading } = authClient.useSession();

  useEffect(() => {
    if (!session) return;
    authClient.admin
      .hasPermission({
        permission: { user: ['list'] },
      })
      .then(({ data }) => {
        setHasAdminPermission(data?.success ?? false);
      });
  }, [session]);

  if (loading) {
    return <div><Spinner className="size-4" /></div>;
  }

    const user = {
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {hasAdminPermission && <NavMain items={data.navMain} />}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
