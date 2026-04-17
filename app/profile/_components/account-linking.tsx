"use client"

import { BetterAuthActionButton } from "@/components/better-auth-action"
import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import {
    OAUTH_PROVIDERS,
    OAuthProvider,
    SUPPORTED_OAUTH_PROVIDERS,

} from "@/lib/o-auth-providers"
import { Plus, Shield, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/server/util"

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number]

export function AccountLinking({
    currentAccounts,
}: {
    currentAccounts: Account[]
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Linked Accounts</h3>

                {currentAccounts.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-secondary-muted">
                            No linked accounts found
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {currentAccounts.map(account => (
                            <AccountCard
                                key={account.id}
                                provider={account.providerId}
                                account={account}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Link Other Accounts</h3>
                <div className="grid gap-3">
                    {SUPPORTED_OAUTH_PROVIDERS.filter(
                        provider =>
                            !currentAccounts.find(acc => acc.providerId === provider)
                    ).map(provider => (
                        <AccountCard key={provider} provider={provider} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function AccountCard({
    provider,
    account,
}: {
    provider: string
    account?: Account
}) {
    const router = useRouter()

    const providerDetails = OAUTH_PROVIDERS[
        provider as OAuthProvider
    ] ?? {
        name: provider,
        Icon: Shield,
    }

    function linkAccount() {
        return authClient.linkSocial({
            provider,
            callbackURL: "/profile",
        })
    }

    function unlinkAccount() {
        if (account == null) {
            return Promise.resolve({ error: { message: "ํYou can't unlink your only account" } })
        }
        return authClient.unlinkAccount(
            {
                accountId: account.accountId,
                providerId: provider,
            },
            {
                onSuccess: () => {
                    router.refresh()
                },
            }
        )
    }

    return (
        <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {<providerDetails.Icon className="size-5" />}
                        <div>
                            <p className="font-medium">{providerDetails.name}</p>
                            {account == null ? (
                                <p className="text-sm text-muted-foreground">
                                    Connect your {providerDetails.name} account for easier sign-in
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Linked on {formatDate(account.createdAt)}
                                </p>
                            )}
                        </div>
                    </div>
                    {account == null ? (
                        <BetterAuthActionButton
                            variant="outline"
                            size="sm"
                            action={linkAccount}
                        >
                            <Plus />
                            Link
                        </BetterAuthActionButton>
                    ) : (
                        <BetterAuthActionButton
                            variant="destructive"
                            size="sm"
                            action={unlinkAccount}
                        >
                            <Trash2 />
                            Unlink
                        </BetterAuthActionButton>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}