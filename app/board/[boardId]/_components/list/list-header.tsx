"use client";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { ListWithCards } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import z from "zod";
import { ListOptions } from "./list-options";

const formSchema = z.object({
  name: z.string().min(1, { message: "A list's name must not be empty" }),
});

type FormSchema = z.infer<typeof formSchema>;

interface ListHeaderProps {
  listWithCards: ListWithCards;
  onAddCard: () => void;
}

export const ListHeader = ({ listWithCards, onAddCard }: ListHeaderProps) => {
  const form = useForm<FormSchema>({
    defaultValues: {
      name: listWithCards.name,
    },
    resolver: zodResolver(formSchema),
  });

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [oldName, setOldName] = useState(listWithCards.name);

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const updateListName = useMutation(
    trpc.list.updateList.mutationOptions({
      onError: (error) =>
        toast("Error updating list name", {
          description: error.message,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: listWithCards.boardId,
          }),
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
    if (e.key === "Escape" && !updateListName.isPending) {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);

  const onSubmit = (formData: FormSchema) => {
    if (formData.name === listWithCards.name) {
      disableEditing();
      return;
    }
    setOldName(formData.name);
    updateListName.mutate({
      boardId: listWithCards.boardId,
      id: listWithCards.id,
      name: formData.name,
    });
  };

  return (
    <div className="flex font-semibold gap-x-2 items-start justify-between px-2 pt-2 text-sm">
      {isEditing ? (
        <Form {...form}>
          <form
            className="flex-1 px-0.5"
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
                  disabled={updateListName.isPending}
                  id="name"
                  onBlur={onBlur}
                  ref={inputRef}
                />
              )}
            ></FormField>
            <button
              disabled={updateListName.isPending}
              hidden
              type="submit"
            ></button>
          </form>
        </Form>
      ) : (
        <div
          className="border-transparent font-medium h-7 px-2.5 py-1 text-sm w-full"
          onClick={enableEditing}
        >
          {oldName}
        </div>
      )}
      <ListOptions listWithCards={listWithCards} onAddCard={onAddCard} />
    </div>
  );
};
