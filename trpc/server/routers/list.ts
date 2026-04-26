import z from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { boardAction, boards, list } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { uuid } from '@/lib/uuid';

export const ListRouter = createTRPCRouter({
  createList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1, { message: 'Name is required' }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, name } = input;
      const targetBoard = await ctx.db.query.boards.findFirst({
        where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
      });
      if (!targetBoard) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board with the given board id is not found',
        });
      }
      const existingListInBoard = await ctx.db.query.list.findMany({
        orderBy: (lists, { desc }) => [desc(lists.order)],
        where: eq(list.boardId, boardId),
      });
      const lastListOrder =
        existingListInBoard.length > 0 ? existingListInBoard[0].order : 0;
      const newListId = uuid();

      try {
        const [newList] = await Promise.all([
          ctx.db.insert(list).values({
            boardId,
            id: newListId,
            name,
            order: lastListOrder + 1,
          }),
          await ctx.db.insert(boardAction).values({
            action: 'CREATE',
            boardComponent: 'list',
            boardComponentId: newListId,
            boardComponentName: name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        if (!newList)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create list',
          });
        return { newList };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create list or log action',
        });
      }
    }),
  deleteList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, id } = input;

      const targetBoardWithList = await ctx.db.query.boards.findFirst({
        where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
        with: {
          lists: true,
        },
      });
      if (!targetBoardWithList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board with the given board id is not found',
        });
      const targetList = targetBoardWithList.lists.find(
        (list) => list.id === id,
      );
      if (targetBoardWithList.lists.length === 0 || !targetList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'List with the given list id is not found',
        });
      try {
        const [deletedList] = await Promise.all([
          ctx.db
            .delete(list)
            .where(and(eq(list.id, id), eq(list.boardId, boardId))),
          ctx.db.insert(boardAction).values({
            action: 'DELETE',
            boardComponent: 'list',
            boardComponentId: id,
            boardComponentName: targetList.name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        return { deletedList };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete list',
        });
      }
    }),
  updateList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        id: z.string(),
        name: z.string().min(1, { message: 'Name is required' }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, id, name } = input;
      const targetBoardWithList = await ctx.db.query.boards
        .findFirst({
          where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
          with: {
            lists: true,
          },
        })
        .then((boardWithLists) => {
          if (!boardWithLists) return;
          const { lists, ...boardWithoutLists } = boardWithLists;
          return {
            ...boardWithoutLists,
            list: lists.find((list) => list.id === id),
          };
        });

      if (!targetBoardWithList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board with the given board id is not found',
        });
      if (!targetBoardWithList.list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'List with the given list id is not found',
        });

      try {
        const [updatedLists] = await Promise.all([
          ctx.db
            .update(list)
            .set({ name })
            .where(and(eq(list.id, id), eq(list.boardId, boardId))).returning(),
          ctx.db.insert(boardAction).values({
            action: 'UPDATE',
            boardComponent: 'list',
            boardComponentId: id,
            boardComponentName: targetBoardWithList.list.name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        return { updatedLists };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update list',
        });
      }
    }),
});
