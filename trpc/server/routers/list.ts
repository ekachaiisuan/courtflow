import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { boards, list } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";


export const ListRouter = createTRPCRouter({
    createList: protectedProcedure
        .input(
            z.object({
                boardId: z.string(),
                name: z.string().min(1, { message: 'List name must not be empty' } ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { boardId, name } = input;
            const targetBoard = await ctx.db.query.boards.findFirst({
                where: and(eq(boards.id, boardId), eq(boards.userId, ctx.user.id))
            });
            if (!targetBoard) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Board not found',
                });
            }
            const existingListsInBoard = await ctx.db.query.list.findMany({
                where: eq(list.boardId, boardId)
            });
        }),
    });
             
           