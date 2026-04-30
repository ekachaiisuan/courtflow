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
import { Form } from "@/components/ui/form";

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

 
};
