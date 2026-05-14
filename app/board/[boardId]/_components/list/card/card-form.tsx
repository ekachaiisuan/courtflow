"use client";

import { FormSubmit } from "@/components/forms/form-submit";
import { FormTextArea } from "@/components/forms/form-text-area";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { forwardRef, KeyboardEventHandler, RefObject, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { z } from "zod";
const formSchema = z.object({
  name: z.string().min(1, "Card's name must not be empty."),
});

type FormSchema = z.infer<typeof formSchema>;
interface CardFormProps {
  addPendingCard: (name: string) => string;
  disableEditing: () => void;
  enableEditing: () => void;
  isEditing: boolean;
  listId: string;
  removePendingCard: (id: string) => void;
}

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  (
    {
      addPendingCard,
      disableEditing,
      enableEditing,
      isEditing,
      listId,
      removePendingCard,
    },
    ref,
  ) => {
    const form = useForm<FormSchema>({
      defaultValues: {
        name: "",
      },
      resolver: zodResolver(formSchema),
    });
    const params = useParams<{ boardId: string }>();
    const boardId = Array.isArray(params.boardId)
      ? params.boardId[0]
      : params.boardId;
    const formRef = useRef<HTMLFormElement>(null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") disableEditing();
    };

    const onTextAreaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      e,
    ) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    useEventListener("keydown", onKeyDown);
    useOnClickOutside(formRef as RefObject<HTMLElement>, disableEditing);

    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const createCard = useMutation(
      trpc.card.createCard.mutationOptions({
        onError: (error) =>
          toast("Error creating card", {
            description: error.message,
          }),
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: trpc.pages.boardIdPage.queryKey({ boardId: boardId }),
          }),
      }),
    );

    const onSubmit = (formData: FormSchema) => {
      const pendingId = addPendingCard(formData.name);
      form.reset();
      disableEditing();
      createCard.mutate(
        { boardId, listId, name: formData.name },
        {
          onError: (error) => {
            removePendingCard(pendingId);
            toast("Error creating card", {
              description: error.message,
            });
          },
          onSuccess: () => {
            removePendingCard(pendingId);
            queryClient.invalidateQueries({
              queryKey: trpc.pages.boardIdPage.queryKey({ boardId }),
            });
          },
        },
      );
    };

    return isEditing ? (
      <Form {...form}>
        <form
          className="m-1 px-1 py-0.5 space-y-4"
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormTextArea
                {...field}
                id="name"
                onKeyDown={onTextAreaKeyDown}
                placeholder="Enter card name"
                ref={ref}
              />
            )}
          />
          <FormSubmit
            disabled={!form.formState.isValid || createCard.isPending}
          >
            <PlusIcon className="mr-2 size-4" />
            Add Card
          </FormSubmit>
        </form>
      </Form>
    ) : (
      <div className="px-2 pt-2">
        <Button
          className="h-auto justify-start px-2 py-1.5 text-muted-foreground text-sm w-full"
          disabled={createCard.isPending}
          onClick={enableEditing}
          size="sm"
          variant="ghost"
        >
          <PlusIcon className="mr-2 size-4" />
          Add a card
        </Button>
      </div>
    );
  },
);
