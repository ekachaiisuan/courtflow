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
import { Spinner } from "@/components/ui/spinner"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"

const totpSchema = z.object({
    code: z.string().length(6),
})

type TotpForm = z.infer<typeof totpSchema>

export function TotpForm() {
    const router = useRouter()
    const form = useForm<TotpForm>({
        resolver: zodResolver(totpSchema),
        defaultValues: {
            code: "",
        },
    })

    const { isSubmitting } = form.formState

    async function handleTotpVerification(data: TotpForm) {
        await authClient.twoFactor.verifyTotp(data, {
            onError: error => {
                toast.error(error.error.message || "Failed to verify code")
            },
            onSuccess: () => {
                router.push("/dashboard")
            },
        })
    }

    return (

        <form id="totp-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(handleTotpVerification)}
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
            />

            <Button type="submit" form="totp-form" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner className="size-4" /> : "Verify"}
            </Button>
        </form>

    )
}