# Workspace Collaboration Plan

## Background

Current board access is owner-only.

At the moment, boards are tied directly to the user who created them through `boards.userId`, and most board-related queries and mutations check access with logic like:

- `eq(boards.userId, ctx.user.id)`

This means only the board owner can read and write board data. Other users cannot collaborate on the same board even if we want them to create cards or manage work together.

## Goal

Migrate the board system from owner-only access to workspace-based collaboration.

The main product goal is:

- a board should belong to a workspace, not a single user
- multiple users inside the same workspace should be able to collaborate on the same board
- other members should be able to create cards in my board if they are in the same workspace and have the right role

## Chosen V1 Design

We will use a workspace-first model.

### Ownership model
- every board must belong to a workspace
- we will not keep a separate personal-board model in v1
- existing owner-based boards will be migrated into a default workspace for each existing user

### Roles
We will start with 2 workspace roles:

- `admin`
- `member`

### Role behavior in v1
- `admin`
  - create boards
  - rename boards
  - delete boards
  - manage workspace members
  - send invites
  - remove members
  - change member roles
- `member`
  - read boards in the workspace
  - create lists
  - update lists
  - delete lists
  - create cards
  - update cards
  - delete cards
  - reorder lists and cards

### Invite flow
V1 includes member invitation and membership management.

We will support:
- invite member by email
- accept invite through a tokenized link
- attach accepted invite to the currently authenticated user
- revoke or expire invites

## Workspace Concept

A workspace is the main collaboration container in the system.

Typical structure:

- `user`: the person using the app
- `workspace`: a team or department space
- `workspace_members`: which users belong to which workspace
- `boards`: belong to a workspace
- `lists` and `cards`: belong under boards

A single user can belong to multiple workspaces.

Examples:
- my own default workspace
- another team’s workspace that invited me
- a project-specific workspace shared across departments

The system should usually have a current workspace context.

That means:
- dashboard should show boards for the selected workspace
- when switching workspace, the visible boards and allowed actions should switch too

## Data Model Changes

### New tables
We need to add:

#### `workspaces`
Suggested fields:
- `id`
- `name`
- `createdBy`
- `createdAt`
- `updatedAt`

#### `workspace_members`
Suggested fields:
- `id`
- `workspaceId`
- `userId`
- `role`
- `joinedAt`

Constraints:
- unique `(workspaceId, userId)`

#### `workspace_invites`
Suggested fields:
- `id`
- `workspaceId`
- `email`
- `role`
- `token`
- `status`
- `expiresAt`
- `invitedBy`
- `createdAt`

### Existing table changes
#### `boards`
Change ownership from:
- `userId`

to:
- `workspaceId`

### Existing tables that remain
These can stay conceptually the same:
- `list`
- `card`
- `board_actions`

But all board access must now be evaluated through workspace membership.

## Authorization Model

We should stop using board-owner checks as the main access mechanism.

Current pattern:
- `eq(boards.userId, ctx.user.id)`

New pattern:
- verify the current user is a member of the board’s workspace
- verify the current user has the required role for the action

### Required server-side helpers
We should add shared helpers such as:

- `getWorkspaceMember(workspaceId, userId)`
- `requireWorkspaceAccess(workspaceId)`
- `requireWorkspaceRole(workspaceId, "admin")`
- `requireBoardAccess(boardId)`
- `requireBoardAdminAccess(boardId)`

All protected reads and writes must enforce this on the server.

UI role checks may still be used to hide buttons, but UI must never be treated as the security layer.

## Expected Router Changes

### `trpc/server/routers/pages.ts`
- `boardPage` should stop loading boards by `ctx.user.id`
- it should load boards from workspaces where the current user is a member
- ideally include workspace summary info in the result

- `boardIdPage` should stop loading all owned boards and filtering in memory
- it should load the requested board directly by `boardId`
- it should verify workspace membership before returning data

### `trpc/server/routers/board.ts`
- `createBoard` should require `workspaceId`
- only workspace `admin` can create a board
- `updateBoard` and `deleteBoard` should use workspace-based role checks

### `trpc/server/routers/list.ts`
Replace owner-based board checks with workspace/board access checks for:
- `createList`
- `updateList`
- `deleteList`
- `copyList`
- `reorderLists`

### `trpc/server/routers/card.ts`
Replace owner-based board checks with workspace/board access checks for:
- `createCard`
- `updateCard`
- `deleteCard`
- `reorderCards`

### New workspace router
We will likely need a dedicated router for workspace behavior:
- `workspace.create`
- `workspace.listMine`
- `workspace.update`
- `workspace.listMembers`
- `workspace.inviteMember`
- `workspace.acceptInvite`
- `workspace.removeMember`
- `workspace.changeMemberRole`

## UI Changes

### Dashboard
Dashboard should become workspace-aware.

Expected behavior:
- show boards for the selected workspace
- include a workspace switcher
- optionally group boards by workspace if needed

### Board creation
Creating a board should require a workspace context.
- if the user has one workspace, it can be preselected
- if the user has multiple workspaces, user must choose one

### Board page
Board page should receive permission/capability information from the server, such as:
- `canManageBoard`
- `canEditBoard`

These flags are for UI behavior only. Server checks are still required for all sensitive actions.

### Workspace member management
We need UI for:
- viewing members
- inviting by email
- changing role
- removing members

## Migration Strategy

We need a safe migration path from owner-only boards to workspace-based boards.

Chosen approach:
- create one default workspace for each existing user
- move that user’s existing boards into that workspace
- replace board ownership from `userId` to `workspaceId`

This lets old data continue working while aligning everything with the new model.

### Migration assumptions
- after migration, all boards must have a `workspaceId`
- personal boards will no longer exist as a separate ownership type in v1
- existing board action logs can keep `userId` as the actor reference

## Testing and Verification

Minimum scenarios to verify manually:

### Access control
- a non-member cannot open another workspace’s board
- a member can access a shared board in their workspace
- an admin can manage board and workspace settings
- a member cannot perform admin-only workspace actions

### Collaboration
- a member can create a card in a board they have access to
- a member can create/update/delete lists
- a member can create/update/delete cards
- a member can reorder lists and cards

### Invite flow
- admin can invite a member by email
- invited user can accept invite after login
- accepted invite creates a workspace membership
- expired or revoked invite cannot be accepted

### Migration
- old boards still appear after migration
- migrated boards are placed in the correct default workspace
- list/card/action data still resolves correctly after migration

## Important Files and Impacted Areas

Primary implementation areas:
- `db/schema/schedule.ts`
- new workspace schema tables
- `trpc/server/routers/pages.ts`
- `trpc/server/routers/board.ts`
- `trpc/server/routers/list.ts`
- `trpc/server/routers/card.ts`
- shared permission helpers on the server side
- dashboard and board creation UI
- workspace switcher and member management UI

## Final Summary

We are moving from:

- one board belongs to one user

to:

- one board belongs to one workspace
- many users can belong to that workspace
- permissions are enforced through workspace membership and role

This is the foundation required to let other users create cards and collaborate in the same board safely and cleanly.
