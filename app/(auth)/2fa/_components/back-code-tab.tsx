"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const backupCodeSchema = z.object({
    code: z.string().min(1),
})

type BackupCodeForm = z.infer<typeof backupCodeSchema>

export function BackupCodeTab() {
    const router = useRouter()
    const form = useForm<BackupCodeForm>({
        resolver: zodResolver(backupCodeSchema),
        defaultValues: {
            code: "",
        },
    })

    const { isSubmitting } = form.formState

    async function handleBackupCodeVerification(data: BackupCodeForm) {
        await authClient.twoFactor.verifyBackupCode(data, {
            onError: error => {
                toast.error(error.error.message || "Failed to verify code")
            },
            onSuccess: () => {
                router.push("/dashboard")
            },
        })
    }

    return (

        <form id="backup-code-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(handleBackupCodeVerification)}
        >
            <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="code">Code</FieldLabel>
                        <Input
                            {...field}
                            id="code"
                            aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                )}
            ></Controller>


            <Button type="submit" form="backup-code-form" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner className="size-4" /> : "Verify"}
            </Button>
        </form>

    )
}