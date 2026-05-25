import 'server-only';

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { boards, type Board } from '@/db/schema/schedule';
import {
  workspaceMembers,
  type WorkspaceRole,
  type WorkspaceMember,
} from '@/db/schema/workspace';
import { authSession } from '@/server/user';

// Internal guard for board-scoped permission checks.
// This helper intentionally returns a generic FORBIDDEN error when the board
// cannot be resolved, so callers do not leak whether a board exists or the
// user simply lacks access to it.
async function requireBoard(boardId: string): Promise<Board> {
  const board = await db.query.boards.findFirst({
    where: eq(boards.id, boardId),
  });

  if (!board) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have access to this board',
    });
  }

  return board;
}

export async function getWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMember | null> {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId),
    ),
  });

  return member ?? null;
}

export async function requireWorkspaceAccess(
  workspaceId: string,
): Promise<WorkspaceMember> {
  const session = await authSession();

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  const member = await getWorkspaceMember(workspaceId, session.user.id);

  if (!member) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have access to this workspace',
    });
  }

  return member;
}

export async function requireBoardAccess(boardId: string): Promise<Board> {
  const session = await authSession();

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  const board = await requireBoard(boardId);
  const member = await getWorkspaceMember(board.workspaceId, session.user.id);

  if (!member) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have access to this board',
    });
  }

  return board;
}

export async function requireWorkspaceRole(
  workspaceId: string,
  roles: WorkspaceRole | WorkspaceRole[],
): Promise<WorkspaceMember> {
  const member = await requireWorkspaceAccess(workspaceId);
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(member.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have the required workspace role',
    });
  }

  return member;
}

export async function requireBoardAdminAccess(boardId: string): Promise<Board> {
  const board = await requireBoard(boardId);

  await requireWorkspaceRole(board.workspaceId, ['owner', 'admin']);

  return board;
}
