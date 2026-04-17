# Gemini Project Context: Better Auth Admin

This document provides a comprehensive overview of the `better-auth-admin` project, serving as an instructional context for future Gemini CLI interactions.

## Project Overview

**Purpose:** A robust administrative dashboard and authentication boilerplate built with Next.js, Better Auth, and Drizzle ORM. It features multi-role management, 2FA, Passkeys, and advanced security protections.

**Core Technology Stack:**
- **Framework:** Next.js 15 (App Router, React 19)
- **Authentication:** [Better Auth](https://www.better-auth.com/) (Email/Password, Socials, 2FA, Passkeys, Admin Plugin)
- **Database:** PostgreSQL (Neon) with **Drizzle ORM**
- **Security:** [Arcjet](https://arcjet.com/) (Shield, Bot Detection, Rate Limiting, Email Validation)
- **Email:** Resend with React Email
- **Styling:** Tailwind CSS 4, Radix UI, Shadcn/UI

## Architecture & Logic

### Authentication & Permissions
- **Server Side:** `lib/auth.ts` configures Better Auth with Drizzle adapter, Resend for emails, and the Admin plugin.
- **Client Side:** `lib/auth-client.ts` initializes the auth client with 2FA and Admin support.
- **API Route:** `app/api/auth/[...all]/route.ts` is the central hub, protected by Arcjet's `protectSignup` and `slidingWindow` rate limits.
- **Roles:** Defined in `lib/permissions.ts` using Better Auth's `createAccessControl`.
  - `user`: Basic access.
  - `officer`: Can create/read/update projects.
  - `manager`: Can create/read/update/delete projects.
  - `admin`: Full access including user management.

### Database Schema (`db/schema/auth.ts`)
- **user**: Extends default auth schema with `twoFactorEnabled`, `role`, `banned`, and audit timestamps.
- **session**: Includes `ipAddress`, `userAgent`, and `impersonatedBy`.
- **account**: Manages social logins and passwords.
- **two_factor**: Stores TOTP secrets and backup codes.

### Security Implementation
- **Arcjet Protection:** Integrated into the `POST` handler of the auth API route. It checks for bots, disposable emails, and applies rate limits based on user ID or IP.
- **Middleware/Helpers:** `server/user.ts` provides `authIsRequired` and `authIsNotRequired` for server-side redirection.

## Building and Running

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server. |
| `pnpm build` | Builds the application for production. |
| `pnpm start` | Starts the production server. |
| `pnpm lint` | Runs ESLint. |
| `npx drizzle-kit push` | Synchronizes database schema with the DB. |
| `npx drizzle-kit studio` | Opens a web UI for database management. |

## Development Conventions

1.  **Server Actions & Hooks:** Use React 19 server actions for data mutations. Keep core session checks in `server/user.ts`.
2.  **Type Safety:** Leverage TypeScript strictly across the stack (Drizzle, Zod, and Better Auth).
3.  **UI Components:** Use Shadcn/UI (Tailwind 4) located in `components/ui`. Add new components via `npx shadcn@latest add <component>`.
4.  **Security First:** Always ensure new API routes or sensitive actions are protected by appropriate session/role checks.
5.  **Emails:** New email templates should be added to `components/email` using React Email components.

## Key Directories
- `app/admin`: Admin dashboard for user and role management.
- `app/(auth)`: Auth flows (Login, Signup, 2FA, Password Reset).
- `app/profile`: User settings and session management.
- `lib/`: Core logic for auth, permissions, and database clients.
- `server/`: Server-side actions and helper utilities.
