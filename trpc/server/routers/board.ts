import { boardAction, boards } from "@/db/schema";
import { uuid } from "@/lib/uuid";
import { createTRPCRouter, protectedProcedure } from "@/trpc/server/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const BoardRouter = createTRPCRouter({
    createBoard: protectedProcedure.input(z.object({
        name: z.string().min(1,{message:"Name is required"}),
    })).mutation(async ({ctx,input}) => {
        const {name} = input;
        const newBoardId = uuid();  
        try {
            await Promise.all([
                ctx.db.insert(boards).values({
                    id: newBoardId,
                    name,
                    userId: ctx.user.id
                }),
                ctx.db.insert(boardAction).values({
                    action: "CREATE",
                    boardComponent: "board",
                    boardComponentId: newBoardId,
                    boardComponentName: name,
                    boardId: newBoardId,
                    id: uuid(),
                    userId: ctx.user.id
                })
            ])
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create board"
            });
        }
    })
})
