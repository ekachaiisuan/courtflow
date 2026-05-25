"use client";
import { FormInput } from "@/components/forms/form-input";
import { FormSubmit } from "@/components/forms/form-submit";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFormErrors } from "@/lib/form-utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name must not be empty" }),
  workspaceId: z.string().min(1, { message: "Workspace is required" }),
});

type FormSchema = z.infer<typeof formSchema>;

export const BoardCreateForm = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.pages.boardPage.queryOptions());

  const form = useForm<FormSchema>({
    defaultValues: {
      name: "",
      workspaceId: data.defaultWorkspaceId ?? "",
    },
    resolver: zodResolver(formSchema),
  });

  const formattedErrors = formatFormErrors(form.formState.errors);
  const router = useRouter();
  const createBoard = useMutation(trpc.board.createBoard.mutationOptions({
    onError: (error) => toast("Error creating board: ",{
      description: "Error: " + error.message,
    }),
    onSuccess: (data) => {
      toast("Board created successfully");
      router.push(`/board/${data.newBoardId}`); 
    }
  }));

  const canCreateBoard = data.createableWorkspaces.length > 0;
  const onSubmit = (values: FormSchema) => createBoard.mutate({
    ...values,
  })
  
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="workspaceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-neutral-700 text-xs">
                Workspace
              </FormLabel>
              <Select
                disabled={!canCreateBoard || createBoard.isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a workspace" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {data.createableWorkspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInput {...field} id="name" label="Board Name" errors={formattedErrors} />
          )}
        />
        <FormSubmit disabled={!canCreateBoard || createBoard.isPending}>
          Create New
        </FormSubmit>
      </form>
    </Form>
  );
};
