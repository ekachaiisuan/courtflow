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
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useRouter } from "next/navigation"
import { Spinner } from "../ui/spinner"
import { authClient } from "@/lib/auth-client"

const forgotPasswordSchema = z.object({
    email: z.email('invalid email'),
});


export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [isMailSent, setIsMailSent] = React.useState("");
    const { isSubmitting } = form.formState;

    const router = useRouter();

    async function onSubmit(value: z.infer<typeof forgotPasswordSchema>) {
        setIsLoading(true);
        const { data, error } = await authClient.requestPasswordReset({
            email: value.email,
            redirectTo: "/reset-password",
        });
        if (error) {
            toast.error(error.message);
        }
        if (data) {
            toast.success("Reset password link sent successfully");
            setIsMailSent(value.email);
        }

        setIsLoading(false);
    }
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {isMailSent ? (
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Check your email</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        We've sent a reset password link to your email {isMailSent}
                    </p>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>
                            Enter your email below to send reset password link
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="forgot-password-form" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="email">Email</FieldLabel>
                                            <Input
                                                {...field}
                                                id="email"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="m@example.com"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                ></Controller>
                                <Field>
                                    <Button type="submit" form="forgot-password-form" disabled={isSubmitting}>
                                        {isLoading && <Spinner className="size-4" />}
                                        Send Reset Password Link
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>

                </Card>
            )}
        </div>
    )
}
