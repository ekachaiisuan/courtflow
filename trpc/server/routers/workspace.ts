import { TRPCError } from '@trpc/server';
import { and, count, eq } from 'drizzle-orm';
import z from 'zod';

import { user } from '@/db/schema/auth';
import {
  workspaceAuditLogs,
  workspaceMembers,
  workspaces,
  type WorkspaceRole,
} from '@/db/schema/workspace';
import { uuid } from '@/lib/uuid';
import { requireSystemWorkspaceManager } from '@/server/workspace-permissions';
import { createTRPCRouter, protectedProcedure } from '@/trpc/server/init';

const manageableWorkspaceRoleSchema = z.enum(['admin', 'member']);

export const WorkspaceRouter = createTRPCRouter({
  adminList: protectedProcedure.query(async ({ ctx }) => {
    await requireSystemWorkspaceManager();

    const [workspaceRows, memberCounts, owners] = await Promise.all([
      ctx.db.query.workspaces.findMany({
        orderBy: (workspace, { desc }) => [desc(workspace.createdAt)],
      }),
      ctx.db
        .select({
          workspaceId: workspaceMembers.workspaceId,
          memberCount: count(),
        })
        .from(workspaceMembers)
        .groupBy(workspaceMembers.workspaceId),
      ctx.db.query.workspaceMembers.findMany({
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
      owners.map((owner) => [owner.workspaceId, owner]),
    );

    return workspaceRows.map((workspace) => ({
      ...workspace,
      memberCount: memberCountByWorkspaceId.get(workspace.id) ?? 0,
      owner: ownerByWorkspaceId.get(workspace.id)?.user ?? null,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        ownerUserId: z.string().min(1, { message: 'Owner is required' }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireSystemWorkspaceManager();

      const owner = await ctx.db.query.user.findFirst({
        where: eq(user.id, input.ownerUserId),
      });

      if (!owner || owner.banned) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Owner must be an active user',
        });
      }

      const workspaceId = uuid();

      await ctx.db.transaction(async (tx) => {
        await tx.insert(workspaces).values({
          id: workspaceId,
          name: input.name,
          createdBy: ctx.user.id,
        });

        await tx.insert(workspaceMembers).values({
          id: uuid(),
          workspaceId,
          userId: input.ownerUserId,
          role: 'owner',
        });
      });

      return { workspaceId };
    }),

  getById: protectedProcedure
    .input(z.object({ workspaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await requireSystemWorkspaceManager();

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.workspaceId),
        with: {
          members: {
            with: {
              user: true,
            },
          },
          auditLogs: {
            orderBy: (logs, { desc }) => [desc(logs.createdAt)],
          },
        },
      });

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        });
      }

      return workspace;
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().min(1),
        userId: z.string().min(1),
        role: manageableWorkspaceRoleSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireSystemWorkspaceManager();

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        });
      }

      const memberUser = await ctx.db.query.user.findFirst({
        where: eq(user.id, input.userId),
      });

      if (!memberUser || memberUser.banned) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Member must be an active user',
        });
      }

      await ctx.db.insert(workspaceMembers).values({
        id: uuid(),
        workspaceId: input.workspaceId,
        userId: input.userId,
        role: input.role,
      });
    }),

  changeMemberRole: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().min(1),
        userId: z.string().min(1),
        role: manageableWorkspaceRoleSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireSystemWorkspaceManager();

      const member = await ctx.db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, input.workspaceId),
          eq(workspaceMembers.userId, input.userId),
        ),
      });

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace member not found',
        });
      }

      if (member.role === 'owner') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Use transferOwner to change the workspace owner',
        });
      }

      await ctx.db
        .update(workspaceMembers)
        .set({ role: input.role })
        .where(eq(workspaceMembers.id, member.id));
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireSystemWorkspaceManager();

      const member = await ctx.db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, input.workspaceId),
          eq(workspaceMembers.userId, input.userId),
        ),
      });

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace member not found',
        });
      }

      if (member.role === 'owner') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Transfer workspace ownership before removing the owner',
        });
      }

      await ctx.db
        .delete(workspaceMembers)
        .where(eq(workspaceMembers.id, member.id));
    }),

  transferOwner: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().min(1),
        newOwnerUserId: z.string().min(1),
        reason: z.string().min(1).max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireSystemWorkspaceManager();

      const [workspace, oldOwner, newOwnerUser] = await Promise.all([
        ctx.db.query.workspaces.findFirst({
          where: eq(workspaces.id, input.workspaceId),
        }),
        ctx.db.query.workspaceMembers.findFirst({
          where: and(
            eq(workspaceMembers.workspaceId, input.workspaceId),
            eq(workspaceMembers.role, 'owner'),
          ),
        }),
        ctx.db.query.user.findFirst({
          where: eq(user.id, input.newOwnerUserId),
        }),
      ]);

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        });
      }

      if (!oldOwner) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Workspace has no current owner',
        });
      }

      if (oldOwner.userId === input.newOwnerUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New owner must be different from the current owner',
        });
      }

      if (!newOwnerUser || newOwnerUser.banned) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New owner must be an active user',
        });
      }

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(workspaceMembers)
          .set({ role: 'admin' satisfies WorkspaceRole })
          .where(eq(workspaceMembers.id, oldOwner.id));

        const existingNewOwnerMember =
          await tx.query.workspaceMembers.findFirst({
            where: and(
              eq(workspaceMembers.workspaceId, input.workspaceId),
              eq(workspaceMembers.userId, input.newOwnerUserId),
            ),
          });

        if (existingNewOwnerMember) {
          await tx
            .update(workspaceMembers)
            .set({ role: 'owner' satisfies WorkspaceRole })
            .where(eq(workspaceMembers.id, existingNewOwnerMember.id));
        } else {
          await tx.insert(workspaceMembers).values({
            id: uuid(),
            workspaceId: input.workspaceId,
            userId: input.newOwnerUserId,
            role: 'owner',
          });
        }

        await tx.insert(workspaceAuditLogs).values({
          id: uuid(),
          workspaceId: input.workspaceId,
          event: 'workspace.owner_transferred',
          oldOwnerUserId: oldOwner.userId,
          newOwnerUserId: input.newOwnerUserId,
          actorUserId: ctx.user.id,
          reason: input.reason ?? null,
        });
      });
    }),
});
