import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authIsNotRequired } from "@/server/user"
import { TotpForm } from "./_components/totp-form"
import { BackupCodeTab } from "./_components/back-code-tab"

export default async function TwoFactorPage() {
    await authIsNotRequired()

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10" >
            <div className="my-6 px-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            Two-Factor Authentication
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="totp">
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="totp">Authenticator</TabsTrigger>
                                <TabsTrigger value="backup">Backup Code</TabsTrigger>
                            </TabsList>

                            <TabsContent value="totp">
                                <TotpForm />
                            </TabsContent>

                            <TabsContent value="backup">
                                <BackupCodeTab />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>


    )
}