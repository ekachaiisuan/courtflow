import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure} from "../init";
import { boardAction, boards as BoardSchema } from "@/db/schema";
import z from "zod";

export const PagesRouter = createTRPCRouter({
    boardPage: protectedProcedure.query(async ({ctx}) => {
        const boards = await ctx.db.query.boards.findMany({
            where: eq(BoardSchema.userId, ctx.user.id)
        })
        return {boards};
    }),
    boardIdPage: protectedProcedure.input(z.object({
        boardId: z.string()
    })).query(async ({ctx, input}) => {
        const {boardId} = input;
        const [boards,logs] = await Promise.all([
            ctx.db.query.boards.findMany({
                where: eq(BoardSchema.userId, ctx.user.id),
                with:{
                    lists: {
                        orderBy: (lists, {asc}) => [asc(lists.order)],
                        with: {
                            cards: {
                                orderBy: (cards, {asc}) => [asc(cards.order)]
                            }
                        }
                    }
                }
            
            }),
            ctx.db.query.boardAction.findMany({
                where: eq(boardAction.boardId, boardId),
            })
        ])
        return {boards, logs};
    })
});
