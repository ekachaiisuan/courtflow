import { createAuthClient } from "better-auth/react"
import { twoFactorClient, adminClient } from "better-auth/client/plugins"
import { ac, admin, user, officer, manager } from "@/lib/permissions"

export const authClient = createAuthClient({
    plugins: [twoFactorClient({
        onTwoFactorRedirect() {
            window.location.href = "/2fa"
        },
    }), adminClient({
        ac,
        roles: {
            admin,
            user,
            officer,
            manager
        }
    })],
})
