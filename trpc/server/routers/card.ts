import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { and, desc, eq } from "drizzle-orm";
import { boardAction, boards, card } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { uuid } from "@/lib/uuid";

export const CardRouter = createTRPCRouter({
  copyCard: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { cardId } = input;
      const cardToCopy = await ctx.db.query.card.findFirst({
        where: eq(card.id, cardId),
        with: {
          list: {
            with: {
              board: true,
            },
          },
        },
      });
      if (!cardToCopy)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Requested card matching the provided id not found",
        });
      if (cardToCopy.list.board.userId !== ctx.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User does not have access to the board",
        });
      const existingCardsInList = await ctx.db.query.card.findMany({
        orderBy: (cards, { desc }) => [desc(cards.order)],
        where: eq(card.listId, cardToCopy.listId),
      });
      if (existingCardsInList.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No cards found in the list",
        });
      const lastCard = existingCardsInList[0];
      const newCardId = uuid();
      try{
        const [updatedCard] = await Promise.all([
          ctx.db.insert(card).values({
            name: `${cardToCopy.name} (copy)`,
            description: cardToCopy.description,
            id: newCardId,
            listId: cardToCopy.listId,
            order: lastCard.order + 1,
          }),
          ctx.db.insert(boardAction).values({
            action: "CREATE",
            boardComponent: "card",
            boardComponentId: newCardId,
            boardComponentName: `${cardToCopy.name} (copy)`,
            boardId: cardToCopy.list.board.id,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ])
        if(!updatedCard){
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Card not found after inserting into DB",
          });
        }
        return { updatedCard };
      }catch{
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "There was an issue copying the card!",
        });
      }
    }),
  createCard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        description: z.string().optional(),
        listId: z.string(),
        name: z.string().min(1, { message: "Name is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, description, listId, name } = input;
      const targetBoardWithList = await ctx.db.query.boards
        .findFirst({
          where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
          with: {
            lists: {
              with: {
                cards: {
                  orderBy: [desc(card.order)],
                },
              },
            },
          },
        })
        .then((boardWithLists) => {
          if (!boardWithLists) return;
          const { lists, ...boardWithoutLists } = boardWithLists;
          return {
            ...boardWithoutLists,
            list: lists.find((list) => list.id === listId),
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
        const newCardId = uuid();
        const [updatedCard] = await Promise.all([
          ctx.db.insert(card).values({
            name,
            description,
            id: newCardId,
            listId,
            order: targetBoardWithList.list.cards.length + 1,
          }),

          ctx.db.insert(boardAction).values({
            action: "CREATE",
            boardComponent: "list",
            boardComponentId: newCardId,
            boardComponentName: name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        return { updatedCard };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update card",
        });
      }
    }),
  deleteCard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        cardId: z.string(),
        cardName: z.string(),
        listId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, cardId, cardName, listId } = input;
      const targetBoardWithList = await ctx.db.query.boards
        .findFirst({
          where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
          with: {
            lists: {
              with: {
                cards: {
                  orderBy: [desc(card.order)],
                },
              },
            },
          },
        })
        .then((boardWithLists) => {
          if (!boardWithLists) return;
          const { lists, ...boardWithoutLists } = boardWithLists;
          return {
            ...boardWithoutLists,
            list: lists.find((list) => list.id === listId),
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
        const [deletedCard] = await Promise.all([
          ctx.db
            .delete(card)
            .where(and(eq(card.id, cardId), eq(card.listId, listId))),
          ctx.db.insert(boardAction).values({
            action: "DELETE",
            boardComponent: "card",
            boardComponentId: cardId,
            boardComponentName: cardName,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        return { deletedCard };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete card",
        });
      }
    }),
  reorderCards: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        cardsToReorder: z.array(
          z.object({
            id: z.string(),
            listId: z.string(),
            name: z.string(),
            order: z.number().int(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, cardsToReorder } = input;
      const targetBoard = await ctx.db.query.boards.findFirst({
        where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
      });
      try {
        const updatePromises = cardsToReorder.map((cards) =>
          ctx.db
            .update(card)
            .set({
              listId: cards.listId,
              order: cards.order,
            })
            .where(eq(card.id, cards.id))
            .returning(),
        );
        const results = await Promise.all(updatePromises);
        const updateCards = results.flat();

        await ctx.db.insert(boardAction).values(
          cardsToReorder.map((card) => ({
            action: "UPDATE" as const,
            boardComponent: "card" as const,
            boardComponentId: card.id,
            boardComponentName: card.name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          })),
        );
        return { updateCards };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reorder cards",
        });
      }
    }),
  updateCard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        cardId: z.string(),
        listId: z.string(),
        description: z.string().optional(),
        name: z.string().min(1, { message: "Name is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, cardId, name, listId, description } = input;
      const targetBoardWithList = await ctx.db.query.boards
        .findFirst({
          where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id)),
          with: {
            lists: {
              with: {
                cards: {
                  orderBy: [desc(card.order)],
                },
              },
            },
          },
        })
        .then((boardWithLists) => {
          if (!boardWithLists) return;
          const { lists, ...boardWithoutLists } = boardWithLists;
          return {
            ...boardWithoutLists,
            list: lists.find((list) => list.id === listId),
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
        const [updatedCards] = await Promise.all([
          ctx.db
            .update(card)
            .set({ name })
            .where(and(eq(card.id, cardId), eq(card.listId, listId)))
            .returning(),
          ctx.db.insert(boardAction).values({
            action: "UPDATE",
            boardComponent: "list",
            boardComponentId: cardId,
            boardComponentName: name,
            boardId,
            id: uuid(),
            userId: ctx.user.id,
          }),
        ]);
        return { updatedCards };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update list",
        });
      }
    }),
});
