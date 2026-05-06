import { createTRPCRouter } from "../init";
import { BoardRouter } from "./board";
import { PagesRouter } from "./pages";
import { ListRouter } from "./list";
import { CardRouter } from "./card";

// =============================================================================
// APP ROUTER - Root tRPC router that combines all sub-routers
// =============================================================================
//
// WHY: This is the main entry point for all tRPC procedures. Sub-routers
// can be added here to organize procedures by feature/domain.
//
// EXAMPLE USAGE:
//   import { userRouter } from "./user";
//   import { postRouter } from "./post";
//
//   export const appRouter = createTRPCRouter({
//     user: userRouter,
//     post: postRouter,
//   });
//
// THEN ON CLIENT:
//   trpc.user.getProfile.useQuery()
//   trpc.post.create.useMutation()
// =============================================================================

export const appRouter = createTRPCRouter({
  // Add routers here as you build features
  // Example: user: userRouter,
  board: BoardRouter,
  pages: PagesRouter,
  list: ListRouter,
  card: CardRouter,
});

export type AppRouter = typeof appRouter;