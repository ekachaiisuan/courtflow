import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { authSession } from "@/server/user"
import { SessionManagement } from "./_components/session-management"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { SetPasswordButton } from "./_components/set-password-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordForm } from "./_components/change-password-form"
import { AccountLinking } from "./_components/account-linking"
import { TwoFactorAuth } from "./_components/two-factor-auth"
import Profile from "./_components/profile"

export default async function Page() {
    const session = await authSession()
    if (session == null) {
        return redirect("/login")
    }

    const isHeaders = await headers()

    const sessions = await auth.api.listSessions({
        headers: isHeaders
    })

    const accounts = await auth.api.listUserAccounts({
        headers: isHeaders
    })

    const hasPasswordAccount = accounts.some(a => a.providerId === "credential")

    const nonCredentialAccounts = accounts.filter(a => a.providerId !== "credential")

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Office Management Platform
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Profile</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="bg-muted/50  flex-1 rounded-xl md:min-h-min" >
                        <Profile />
                    </div>

                    <div className="bg-muted/50  flex-1 rounded-xl md:min-h-min space-y-4" >
                        <div id="password-section">
                            {hasPasswordAccount ? (
                                <ChangePasswordForm />
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Set Password</CardTitle>
                                    </CardHeader>
                                    <CardDescription>
                                        We will send you an email to set your password
                                    </CardDescription>
                                    <CardContent>
                                        <SetPasswordButton email={session.user.email} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div id="two-factor-auth-section">
                            {
                                hasPasswordAccount && (
                                    <TwoFactorAuth isTwoFAEnabled={session.user.twoFactorEnabled ?? false} />
                                )
                            }
                        </div>

                    </div>
                    <div className="bg-muted/50  flex-1 rounded-xl md:min-h-min" >
                        <SessionManagement sessions={sessions} currentSessionToken={session.session.token} />
                    </div>
                    <div className="bg-muted/50  flex-1 rounded-xl md:min-h-min">
                        <AccountLinking currentAccounts={nonCredentialAccounts} />
                    </div>

                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
