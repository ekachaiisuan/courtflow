"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, Form, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Spinner } from "@/components/ui/spinner"
import { PasswordInput } from "@/components/ui/password-input"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"



const twoFactorAuthSchema = z.object({
    password: z.string().min(1),
})

type TwoFactorData = {
    totpURI: string
    backupCodes: string[]
}

export function TwoFactorAuth({
    className,
    isTwoFAEnabled,
    ...props
}: React.ComponentProps<"div"> & { isTwoFAEnabled: boolean }) {
    const router = useRouter()

    const form = useForm<z.infer<typeof twoFactorAuthSchema>>({
        resolver: zodResolver(twoFactorAuthSchema),
        defaultValues: {
            password: '',
        },
    });

    const [isEnabled, setIsEnabled] = React.useState(isTwoFAEnabled);
    const [twoFactorData, setTwoFactorData] = React.useState<TwoFactorData | null>(null)
    const { isSubmitting } = form.formState;


    async function handleEnable(value: z.infer<typeof twoFactorAuthSchema>) {
        console.log(value)

        const { data, error } = await authClient.twoFactor.enable({
            password: value.password
        })
        if (error) {
            toast.error(error.message || "Failed to enable two factor authentication")
        }
        if (data) {
            form.reset()
            router.refresh()
            setIsEnabled(true)
            setTwoFactorData(data)
            toast.success("Two factor authentication enabled successfully")
        }

    }

    async function handleDisable(value: z.infer<typeof twoFactorAuthSchema>) {

        const { data, error } = await authClient.twoFactor.disable({
            password: value.password
        })
        if (error) {
            toast.error(error.message || "Failed to disable two factor authentication")
        }
        if (data) {
            form.reset()
            router.refresh()
            setIsEnabled(false)
            toast.success("Two factor authentication disabled successfully")
        }
    }

    if (twoFactorData != null) {
        return (
            <QRCodeVerify
                {...twoFactorData}
                onDone={() => {
                    setTwoFactorData(null)
                }}
            />
        )
    }

    return (
        <div className={cn("flex flex-col gap-4", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between">
                        Two Factor Authentication
                        {isEnabled ? (
                            <Badge variant="secondary">Enabled</Badge>
                        ) : (
                            <Badge variant="destructive">Disabled</Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Enter your password to enable or disable two factor authentication
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="twoFa-Form" onSubmit={form.handleSubmit(isEnabled ? handleDisable : handleEnable)}>
                        <FieldGroup className="max-w-sm">
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <PasswordInput
                                            {...field}
                                            id="password"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            ></Controller>
                            <Field>
                                <Button type="submit"
                                    form="twoFa-Form"
                                    variant={isEnabled ? "destructive" : "default"}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner className="size-4" /> : isEnabled ? "Disable 2FA" : "Enable 2FA"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

const qrSchema = z.object({
    token: z.string().length(6),
})

type QrForm = z.infer<typeof qrSchema>

function QRCodeVerify({
    totpURI,
    backupCodes,
    onDone,
}: TwoFactorData & { onDone: () => void }) {
    const [successfullyEnabled, setSuccessfullyEnabled] = React.useState(false)
    const router = useRouter()
    const form = useForm<QrForm>({
        resolver: zodResolver(qrSchema),
        defaultValues: { token: "" },
    })

    const { isSubmitting } = form.formState

    async function handleQrCode(data: QrForm) {
        await authClient.twoFactor.verifyTotp(
            {
                code: data.token,
            },
            {
                onError: error => {
                    toast.error(error.error.message || "Failed to verify code")
                },
                onSuccess: () => {
                    setSuccessfullyEnabled(true)
                    router.refresh()
                },
            }
        )
    }

    if (successfullyEnabled) {
        return (
            <>
                <p className="text-sm text-muted-foreground mb-2">
                    Save these backup codes in a safe place. You can use them to access
                    your account.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-sm">
                            {code}
                        </div>
                    ))}
                </div>
                <Button variant="outline" onClick={onDone}>
                    Done
                </Button>
            </>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground">
                Scan this QR code with your authenticator app and enter the code below:
            </p>


            <form id="twoFa-Qr-Form" className="space-y-4" onSubmit={form.handleSubmit(handleQrCode)}>
                <FieldGroup className="max-w-sm">
                    <Controller
                        name="token"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="token">Token</FieldLabel>
                                <Input
                                    {...field}
                                    id="token"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    ></Controller>


                    <Field>
                        <Button type="submit"
                            form="twoFa-Qr-Form"
                            disabled={isSubmitting}>
                            {isSubmitting ? <Spinner className="size-4" /> : "Submit Code"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>

            <div className="p-4 bg-white w-fit">
                <QRCode size={256} value={totpURI} />
            </div>
        </div>
    )
}