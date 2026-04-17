'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createProject } from '@/server/project';
import { Spinner } from '@/components/ui/spinner';

const PROJECT_STATUSES = ['draft', 'active', 'finished'] as const;

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters long'),
  status: z.enum(PROJECT_STATUSES),
  description: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  users: z
    .array(z.object({ email: z.email() }))
    .min(1)
    .max(5),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function Profile() {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      status: 'draft',
      description: '',
      notifications: {
        email: false,
        sms: false,
        push: false,
      },
      users: [{ email: '' }],
    },
  });

  const { isSubmitting } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'users',
  });

  async function onSubmit(data: ProjectFormValues) {
    const res = await createProject(data);

    if (res.success) {
      toast.success('Project created successfully!', {
        description: JSON.stringify(data, null, 2),
      });
      return;
    }

    toast.error('Failed to create project.');
  }

  return (
    <div className="container mx-auto my-6 px-4">
      <form
        id="form-rhf-profile"
        className="max-w-2xl space-y-7"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-profile-name">
                  Project Name
                </FieldLabel>
                <Input
                  {...field}
                  id="form-rhf-profile-name"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  placeholder="Enter project name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-profile-status">
                  Status
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="form-rhf-profile-status"
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-profile-description">
                  Description
                </FieldLabel>
                <Textarea
                  {...field}
                  id="form-rhf-profile-description"
                  value={field.value ?? ''}
                  aria-invalid={fieldState.invalid}
                  placeholder="Project details (optional)"
                />
                <FieldDescription>
                  Optional short summary of the project.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="space-y-3">
            <p className="text-sm font-medium">Notifications</p>
            <Controller
              name="notifications.email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id="form-rhf-profile-notification-email"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor="form-rhf-profile-notification-email">
                    Email
                  </FieldLabel>
                </Field>
              )}
            />
            <Controller
              name="notifications.sms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id="form-rhf-profile-notification-sms"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor="form-rhf-profile-notification-sms">
                    SMS
                  </FieldLabel>
                </Field>
              )}
            />
            <Controller
              name="notifications.push"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id="form-rhf-profile-notification-push"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor="form-rhf-profile-notification-push">
                    Push
                  </FieldLabel>
                </Field>
              )}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Users</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ email: '' })}
                disabled={fields.length >= 5}
              >
                Add user
              </Button>
            </div>

            {fields.map((item, index) => (
              <Controller
                key={item.id}
                name={`users.${index}.email`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={`form-rhf-profile-user-email-${index + 1}`}
                    >
                      User {index + 1} Email
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        id={`form-rhf-profile-user-email-${index + 1}`}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="user@example.com"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}

            <FieldError
              errors={[
                form.formState.errors.users as { message?: string } | undefined,
              ]}
            />
          </div>
        </FieldGroup>

        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4" /> : 'Create Project'}
        </Button>
      </form>
    </div>
  );
}
