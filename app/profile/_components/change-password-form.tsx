'use client'

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
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Spinner } from "@/components/ui/spinner"
import { PasswordInput } from "@/components/ui/password-input"
import { authClient } from "@/lib/auth-client"
import { Checkbox } from "@/components/ui/checkbox"

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    revokeOtherSessions: z.boolean(),
})

export function ChangePasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            revokeOtherSessions: true,
        },
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const { isSubmitting } = form.formState;

    async function onSubmit(value: z.infer<typeof changePasswordSchema>) {
        setIsLoading(true);
        await authClient.changePassword(value, {
            onError: error => {
                toast.error(error.error.message || "Failed to change password")
            },
            onSuccess: () => {
                toast.success("Password changed successfully")
                form.reset()
            },
        })
        setIsLoading(false);
    }

    return (
        <div className={cn("flex flex-col gap-4", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Enter your new password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="change-password-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="max-w-sm">
                            <Controller
                                name="currentPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="password">Current Password</FieldLabel>
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
                            <Controller
                                name="newPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                        <PasswordInput
                                            {...field}
                                            id="newPassword"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            ></Controller>
                            <Controller
                                name="revokeOtherSessions"
                                control={form.control}
                                render={({ field, fieldState }) => (

                                    <Field data-invalid={fieldState.invalid} orientation="horizontal">

                                        <Checkbox
                                            id="revokeOtherSessions"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldLabel htmlFor="revokeOtherSessions">
                                            Logout Other Sessions
                                        </FieldLabel>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            ></Controller>
                            <Field>
                                <Button type="submit" form="change-password-form" disabled={isSubmitting}>
                                    {isLoading && <Spinner className="size-4" />}
                                    Change Password
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
