import { eq, inArray } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure} from "../init";
import { boardAction, boards as BoardSchema } from "@/db/schema";
import { workspaces, workspaceMembers } from "@/db/schema/workspace";
import { requireBoardAccess } from "@/server/workspace-permissions";
import z from "zod";

export const PagesRouter = createTRPCRouter({
    boardPage: protectedProcedure.query(async ({ctx}) => {
        const memberships = await ctx.db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.userId, ctx.user.id),
        });

        const workspaceIds = memberships.map((membership) => membership.workspaceId);

        if (workspaceIds.length === 0) {
            return {
                boards: [],
                createableWorkspaces: [],
                defaultWorkspaceId: null,
            };
        }

        const [boards, workspaceRecords] = await Promise.all([
            ctx.db.query.boards.findMany({
                where: inArray(BoardSchema.workspaceId, workspaceIds),
            }),
            ctx.db.query.workspaces.findMany({
                where: inArray(workspaces.id, workspaceIds),
            }),
        ]);

        const workspaceById = new Map(
            workspaceRecords.map((workspace) => [workspace.id, workspace]),
        );

        const createableWorkspaces = memberships
            .filter((membership) => membership.role === "owner" || membership.role === "admin")
            .map((membership) => {
                const workspace = workspaceById.get(membership.workspaceId);

                return workspace
                    ? {
                        id: workspace.id,
                        name: workspace.name,
                        role: membership.role,
                    }
                    : null;
            })
            .filter((workspace) => workspace !== null);

        const boardsWithWorkspace = boards.map((board) => ({
            ...board,
            workspaceName: workspaceById.get(board.workspaceId)?.name ?? "Workspace",
        }));

        return {
            boards: boardsWithWorkspace,
            createableWorkspaces,
            defaultWorkspaceId: createableWorkspaces[0]?.id ?? null,
        };
    }),
    boardIdPage: protectedProcedure.input(z.object({
        boardId: z.string()
    })).query(async ({ctx, input}) => {
        const {boardId} = input;
        await requireBoardAccess(boardId);

        const [board,logs] = await Promise.all([
            ctx.db.query.boards.findFirst({
                where: eq(BoardSchema.id, boardId),
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
        if (!board) {
            throw new Error("Board not found after access check");
        }
        return {board, logs};
    })
});
