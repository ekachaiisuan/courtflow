import { relations, sql } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const workspaceRoleEnum = pgEnum('workspace_role', [
  'owner',
  'admin',
  'member',
]);

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: workspaceRoleEnum('role').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('workspace_members_workspace_user_unique').on(
      table.workspaceId,
      table.userId,
    ),
    index('workspace_members_user_id_idx').on(table.userId),
    index('workspace_members_workspace_id_idx').on(table.workspaceId),
    uniqueIndex('workspace_members_single_owner_unique')
      .on(table.workspaceId)
      .where(sql`${table.role} = 'owner'`),
  ],
);

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;

export const workspaceAuditLogs = pgTable(
  'workspace_audit_logs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    event: text('event').notNull(),
    oldOwnerUserId: text('old_owner_user_id').notNull(),
    newOwnerUserId: text('new_owner_user_id').notNull(),
    actorUserId: text('actor_user_id').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('workspace_audit_logs_workspace_id_idx').on(table.workspaceId),
    index('workspace_audit_logs_actor_user_id_idx').on(table.actorUserId),
  ],
);

export type WorkspaceAuditLog = typeof workspaceAuditLogs.$inferSelect;

export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  createdByUser: one(user, {
    fields: [workspaces.createdBy],
    references: [user.id],
  }),
  members: many(workspaceMembers),
  auditLogs: many(workspaceAuditLogs),
}));

export const workspaceMemberRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(user, {
      fields: [workspaceMembers.userId],
      references: [user.id],
    }),
  }),
);

export const workspaceAuditLogRelations = relations(
  workspaceAuditLogs,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceAuditLogs.workspaceId],
      references: [workspaces.id],
    }),
  }),
);
