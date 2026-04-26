import { boardAction, boards } from '@/db/schema';
import { uuid } from '@/lib/uuid';
import { createTRPCRouter, protectedProcedure } from '@/trpc/server/init';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

export const BoardRouter = createTRPCRouter({
  createBoard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: 'Name is required' }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name } = input;
      const newBoardId = uuid();
      try {
        await Promise.all([
          ctx.db.insert(boards).values({
            id: newBoardId,
            name,
            userId: ctx.user.id,
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
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create board',
        });
      }
    }),
  // owner is the user who deletes the board
  deleteBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId } = input;
      try {
        await ctx.db
          .delete(boards)
          .where(and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)));
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
      try {
        await Promise.all([
          ctx.db
            .update(boards)
            .set({ name })
            .where(and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id))),
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
