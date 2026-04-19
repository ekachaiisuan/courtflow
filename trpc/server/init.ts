import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import { authSession } from '@/server/user';
import { db } from '@/db/drizzle';
import { Session } from 'better-auth';

export const createTRPCContext = cache(async () => {
  const auth = await authSession();
  return {db, session: auth?.session ?? null,user: auth?.user ?? null };
 
});

type Context = {
  db: typeof db;
  session: Session | null
  user: any
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new Error('Not authenticated');
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
  }),
);
