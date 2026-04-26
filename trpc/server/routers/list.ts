import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { list } from "@/db/schema";


export const ListRouter = createTRPCRouter({
    createList: protectedProcedure
        .input(
            z.object({
                boardId: z.string(),
                name: z.string().min(1, { message: 'Name is required' } ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { boardId, name } = input;
            
        }),
    });
             
           