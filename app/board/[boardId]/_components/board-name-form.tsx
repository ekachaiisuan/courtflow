"use client";

import { useEventListener } from "usehooks-ts";
import { Board } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Form, FormField } from "@/components/ui/form";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name must not be empty" }),
});

type FormSchema = z.infer<typeof formSchema>;

interface BoardNameFormProps {
  board: Board;
}

export const BoardNameForm = ({ board }: BoardNameFormProps) => {
  const form = useForm<FormSchema>({
    defaultValues: {
      name: board.name,
    },
    resolver: zodResolver(formSchema),
  });

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const updateBoardName = useMutation(
    trpc.board.updateBoard.mutationOptions({
      onError: (error) =>
        toast("Error updating board name", {
          description: error.message,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({ boardId: board.id }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardPage.queryKey(),
        });
      },
    }),
  );

  const disableEditing = () => setIsEditing(false);
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
    disableEditing();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !updateBoardName.isPending) {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);

  const onSubmit = (formData: FormSchema) => {
    if (formData.name === board.name) {
      disableEditing();
      return;
    }

    updateBoardName.mutate({
      boardId: board.id,
      name: formData.name,
    });
  };

  return isEditing ? (
    <Form {...form}>
      <form
        className="flex gap-x-2 items-center"
        onSubmit={form.handleSubmit(onSubmit)}
        ref={formRef}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInput
              {...field}
              className="bg-transparent border-none focus-visible:outline-none 
  focus-visible:ring-transparent font-blod h-7 px-1.75 py-1 text-lg"
              disabled={updateBoardName.isPending}
              id="name"
              onBlur={onBlur}
              ref={inputRef}
            />
          )}
        ></FormField>
        <button
          disabled={updateBoardName.isPending}
          hidden
          type="submit"
        ></button>
      </form>
    </Form>
  ) :(
    <Button 
    className="font-bold h-auto px-2 py-1 text-lg w-auto" 
    onClick={enableEditing}
    variant="transparent"
    >
      {board.name}

    </Button>
  )
};
