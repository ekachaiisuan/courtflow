"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import z from "zod";

import { useTRPC } from "@/trpc/client";
import { FormPopover } from "@/components/forms/form-popover";
import { FormInput } from "@/components/forms/form-input";
import { FormSubmit } from "@/components/forms/form-submit";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFormErrors } from "@/lib/form-utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Workspace name is required" }),
  ownerUserId: z.string().min(1, { message: "Owner is required" }),
});

type FormSchema = z.infer<typeof formSchema>;

export function CreateWorkspace() {
  const trpc = useTRPC();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: users, isLoading } = useQuery(
    trpc.workspace.listActiveUsers.queryOptions()
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ownerUserId: "",
    },
  });

  const createWorkspace = useMutation(
    trpc.workspace.create.mutationOptions({
      onSuccess: () => {
        toast.success("Workspace created successfully");
        form.reset();
        setOpen(false);
        router.refresh();
      },
      onError: (error) => {
        toast.error("Error creating workspace", {
          description: error.message,
        });
      },
    })
  );

  const onSubmit = (values: FormSchema) => {
    createWorkspace.mutate(values);
  };

  const formattedErrors = formatFormErrors(form.formState.errors);

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInput
              {...field}
              id="name"
              label="Workspace Name"
              placeholder="Enter workspace name"
              errors={formattedErrors}
              disabled={createWorkspace.isPending}
            />
          )}
        />
        <FormField
          control={form.control}
          name="ownerUserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-neutral-700 text-xs">
                Owner
              </FormLabel>
              <Select
                disabled={isLoading || createWorkspace.isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={isLoading ? "Loading users..." : "Select an owner"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit disabled={createWorkspace.isPending}>
          Create New
        </FormSubmit>
      </form>
    </Form>
  );

  return (
    <FormPopover
      disabled={false}
      formContent={formContent}
      prompt="Create Workspace"
      side="bottom"
      sideOffset={10}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Create Workspace
      </Button>
    </FormPopover>
  );
}
