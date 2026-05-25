import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { boardAction, boards, card, list } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { uuid } from "@/lib/uuid";
import { requireBoardAccess } from "@/server/workspace-permissions";

export const ListRouter = createTRPCRouter({
  copyList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, id } = input;
      await requireBoardAccess(boardId);

      const listToCopy = await ctx.db.query.list.findFirst({
        where: eq(list.id, id),
      });
      if (!listToCopy)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List with the given id is not found",
        });
      const targetBoard = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });
      if (!targetBoard)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board with the given board id is not found",
        });
      const [cardsToCopy, existingListsInBoard] = await Promise.all([
        ctx.db.query.card.findMany({
          where: eq(card.listId, listToCopy.id),
        }),
        ctx.db.query.list.findMany({
          orderBy: (lists, { desc }) => [desc(lists.order)],
          where: eq(list.boardId, boardId),
        }),
      ]);

      if (existingListsInBoard.length === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lists in boards don't exist so there's nothing to copy",
        });

      const lastListOrder = existingListsInBoard[0].order;
      const newListId = uuid();
      try {
        const [newList] = await Promise.all([
          ctx.db
            .insert(list)
            .values({
              boardId,
              id: newListId,
              name: listToCopy.name,
              order: lastListOrder + 1,
            })
            .returning()
            .then((lists) => lists.find((list) => list.id === newListId)),
          ctx.db.insert(boardAction).values({
            action: "CREATE",
            boardComponent: "list",
            boardComponentId: newListId,
            boardComponentName: listToCopy.name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        if (cardsToCopy.length > 0) {
          const cardsToCopyInserts = cardsToCopy.map((card) => {
            const copyCardId = uuid();
            return {
              ...card,
              id: copyCardId,
              listId: newListId,
            };
          });
          await Promise.all([
            ctx.db.insert(card).values(cardsToCopyInserts),
            ctx.db.insert(boardAction).values(cardsToCopyInserts.map((card) => ({
              action: "CREATE" as const,
              boardComponent: "card" as const,
              boardComponentId: card.id,
              boardComponentName: card.name,
              boardId,
              id: uuid(),
              userId: ctx.user.id,
            }))),
          ])
        }
        return { newList };
      } catch  {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to copy list",
        });
      }
    }),
  createList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1, { message: "Name is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, name } = input;
      await requireBoardAccess(boardId);

      const targetBoard = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });
      if (!targetBoard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board with the given board id is not found",
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
            action: "CREATE",
            boardComponent: "list",
            boardComponentId: newListId,
            boardComponentName: name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        if (!newList)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create list",
          });
        return { newList };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create list or log action",
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
      await requireBoardAccess(boardId);

      const targetBoardWithList = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, boardId),
        with: {
          lists: true,
        },
      });
      if (!targetBoardWithList)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board with the given board id is not found",
        });
      const targetList = targetBoardWithList.lists.find(
        (list) => list.id === id,
      );
      if (targetBoardWithList.lists.length === 0 || !targetList)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List with the given list id is not found",
        });
      try {
        const [deletedList] = await Promise.all([
          ctx.db
            .delete(list)
            .where(and(eq(list.id, id), eq(list.boardId, boardId))),
          ctx.db.insert(boardAction).values({
            action: "DELETE",
            boardComponent: "list",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete list",
        });
      }
    }),
        reorderLists: protectedProcedure.input(z.object({
          boardId: z.string(),
          listsToReorder: z.array(z.object({
            id: z.string(),
            name: z.string(),
            order: z.number().int(),
          })),
        })).mutation(async ({ ctx, input }) => {
          const {boardId, listsToReorder} = input;
          await requireBoardAccess(boardId);

          const targetBoard = await ctx.db.query.boards.findFirst({
            where: eq(boards.id, boardId),
          })

          if (!targetBoard) throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Board with the given board id is not found',
          })

          try{
            const updatePromises = listsToReorder.map(lists => ctx.db.update(list).set({
              order: lists.order,
            }).where(eq(list.id, lists.id)).returning());
            const results = await Promise.all(updatePromises);
            const updatedlists = results.flat();
    
            await ctx.db.insert(boardAction).values(
              listsToReorder.map(list => ({
                action: 'UPDATE' as const,
                boardComponent: 'list' as const,
                boardComponentId: list.id,
                boardComponentName: list.name,
                boardId: targetBoard.id,
                id: uuid(),
                userId: ctx.user.id
              }))
            )
            return {updatedlists};
    
          }catch{
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'There was an issue while reordering the lists',
            });
          }
    
        }),
  updateList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        id: z.string(),
        name: z.string().min(1, { message: "Name is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, id, name } = input;
      await requireBoardAccess(boardId);

      const targetBoardWithList = await ctx.db.query.boards
        .findFirst({
          where: eq(boards.id, boardId),
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
          code: "NOT_FOUND",
          message: "Board with the given board id is not found",
        });
      if (!targetBoardWithList.list)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "List with the given list id is not found",
        });

      try {
        const [updatedLists] = await Promise.all([
          ctx.db
            .update(list)
            .set({ name })
            .where(and(eq(list.id, id), eq(list.boardId, boardId)))
            .returning(),
          ctx.db.insert(boardAction).values({
            action: "UPDATE",
            boardComponent: "list",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update list",
        });
      }
    }),
});
