import { boardAction, boards } from '@/db/schema';
import { uuid } from '@/lib/uuid';
import {
  requireBoardAdminAccess,
  requireBoardOwnerAccess,
  requireWorkspaceRole,
} from '@/server/workspace-permissions';
import { createTRPCRouter, protectedProcedure } from '@/trpc/server/init';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const BoardRouter = createTRPCRouter({
  createBoard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        workspaceId: z.string().min(1, { message: 'Workspace is required' }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, workspaceId } = input;
      const newBoardId = uuid();

      await requireWorkspaceRole(workspaceId, ['owner', 'admin']);

      try {
        await Promise.all([
          ctx.db.insert(boards).values({
            id: newBoardId,
            name,
            workspaceId,
          }),
          ctx.db.insert(boardAction).values({
            action: 'CREATE',
            boardComponent: 'board',
            boardComponentId: newBoardId,
            boardComponentName: name,
            boardId: newBoardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        return { newBoardId };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create board',
        });
      }
    }),
  deleteBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId } = input;

      await requireBoardAdminAccess(boardId);

      try {
        await ctx.db.delete(boards).where(eq(boards.id, boardId));
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete board',
        });
      }
    }),
  updateBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, name } = input;

      await requireBoardAdminAccess(boardId);

      try {
        await Promise.all([
          ctx.db
            .update(boards)
            .set({ name })
            .where(eq(boards.id, boardId)),
          ctx.db.insert(boardAction).values({
            action: 'UPDATE',
            boardComponent: 'board',
            boardComponentId: boardId,
            boardComponentName: name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update board',
        });
      }
    }),
});
