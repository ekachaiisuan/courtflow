import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  integer,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { relations } from 'drizzle-orm';
import type { User } from 'better-auth';

export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type Board = typeof boards.$inferSelect;
export const boardActionEnum = pgEnum('board_action', [
  'CREATE',
  'UPDATE',
  'DELETE',
]);
export type BoardAction = 'CREATE' | 'UPDATE' | 'DELETE';
export const boardComponentTypeEnum = pgEnum('board_component_type', [
  'board',
  'card',
  'list',
]);
export type BoardComponentType = 'board' | 'card' | 'list';

export const boardAction = pgTable('board_actions', {
  action: boardActionEnum('action').notNull(),
  boardComponent: boardComponentTypeEnum('board_component').notNull(),
  boardComponentId: text('component_id').notNull(),
  boardComponentName: text('component_name').notNull(),
  boardId: text('board_id')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const boardActionRelation = relations(boardAction, ({ one }) => ({
    board: one(boards, {
      fields: [boardAction.boardId],
      references: [boards.id],
    }),
    user: one(user, {
      fields: [boardAction.userId],
      references: [user.id],
    }),
}));

export type BoardActionLog = typeof boardAction.$inferSelect;
export type BoardActionLogWithUser = typeof boardAction.$inferSelect & {
  user: User;
};
export type BoardActionLogWithBoard = typeof boardAction.$inferSelect & {
  board: Board;
};
