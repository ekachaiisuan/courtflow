import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure} from "../init";
import { boards as BoardSchema } from "@/db/schema";

export const PagesRouter = createTRPCRouter({
    boardPage: protectedProcedure.query(async ({ctx}) => {
        const boards = await ctx.db.query.boards.findMany({
            where: eq(BoardSchema.userId, ctx.user.id)
        })
        return {boards};
    })
});
