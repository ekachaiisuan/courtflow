import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { Resend } from 'resend';
import VerifyEmail from '@/components/email/verify-email';
import ResetPasswordEmail from '@/components/email/reset-password';
import { createAuthMiddleware } from 'better-auth/api';
import WelcomeEmail from '@/components/email/welcome-email';
import { twoFactor, admin as adminPlugin } from 'better-auth/plugins';
import { ac, admin, user, officer, manager } from "@/lib/permissions"
import * as authSchema from "@/db/schema/auth"


const resend = new Resend(process.env.RESEND_API_KEY!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, request) => {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Reset your password',
        react: ResetPasswordEmail({
          userEmail: user.email,
          url,
        }),
      })
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, request) => {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Verify your email address',
        react: VerifyEmail({
          username: user.name,
          verifyUrl: url,
        }),
      });
    },
    sendOnSignUp: true,
    expiresIn: 300 //5 minutes
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, //5 minutes
    },
  },
  hooks: {
    after: createAuthMiddleware(async ctx => {
      if (ctx.path.startsWith("/signup")) {
        const user = ctx.context.newSession?.user ?? {
          name: ctx.body.name,
          email: ctx.body.email,
        }
        if (user !== null) {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: 'Welcome to our platform',
            react: WelcomeEmail({
              firstName: user.name,
            }),
          });
        }
      }
    })
  },
  plugins: [nextCookies(), twoFactor(), adminPlugin({
    defaultRole: 'user',
    ac,
    roles: {
      user,
      admin,
      officer,
      manager,
    },
  })],
});
