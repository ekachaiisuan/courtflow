'use client'
import { BetterAuthActionButton } from "@/components/better-auth-action";
import { authClient } from "@/lib/auth-client";

export function SetPasswordButton({ email }: { email: string }) {
    return (
        <BetterAuthActionButton
            value="outline"
            successMessage="Password reset email sent"
            action={() => {
                return authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
            }}
        >
            Send Password Reset Email
        </BetterAuthActionButton>
    )
}