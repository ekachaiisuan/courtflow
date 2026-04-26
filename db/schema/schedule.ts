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
import { desc, relations } from 'drizzle-orm';
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
  boardId: text('board_id').notNull(),
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

export const card = pgTable('card', {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  description: text('description'),
  id: text('id').primaryKey(),
  listId: text('list_id')
    .notNull()
    .references(() => list.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    order: integer('order').notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
});



export type Card = typeof card.$inferSelect;

export const list = pgTable('list', {
  boardId: text('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type List = typeof list.$inferSelect;

export type ListWithCards = typeof list.$inferSelect & {
  cards: Card[];
};

export const listRelation = relations(list, ({ many, one}) => ({
  board: one(boards, {
    fields: [list.boardId],
    references: [boards.id],
  }),
  cards: many(card),
}));

export const cardRelation = relations(card, ({ one }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id],
  }), 
}));

export type CardWithList = typeof card.$inferSelect & {
  list: List;
};