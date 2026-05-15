"use client";

import { AlignLeft } from "lucide-react";
import { RefObject, useRef, useState } from "react";
import { FormSubmit } from "@/components/forms/form-submit";
import { FormTextArea } from "@/components/forms/form-text-area";
import { Form, FormField } from "@/components/ui/form";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { CardWithList } from "@/db/schema";

import { z } from "zod";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  description: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;
interface DescriptionProps {
  cardWithList: CardWithList;
}

export const CardForm = ({ cardWithList }: DescriptionProps) => {
  const form = useForm<FormSchema>({
    defaultValues: {
      description: "",
    },
    resolver: zodResolver(formSchema),
  });

  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [description, setDescription] = useState<string>(
    cardWithList.description ?? "",
  );
  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => setIsEditing(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") disableEditing();
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef as RefObject<HTMLElement>, disableEditing);

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateCard = useMutation(
    trpc.card.updateCard.mutationOptions({
      onError: (error) =>
        toast("Error when updating card", {
          description: error.message,
        }),
      onSuccess: (data) => {
        disableEditing();
        setDescription(
          data.updatedCards.find((card) => card.id === cardWithList.id)
            ?.description ?? "",
        );
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: cardWithList.list.boardId,
          }),
        });
      },
    }),
  );

  const onSubmit = (formData: FormSchema) => {
    form.reset();
    disableEditing();
    if (formData.description === cardWithList.description) return;
    updateCard.mutate({
      boardId: cardWithList.list.boardId,
      cardId: cardWithList.id,
      description: formData.description,
      listId: cardWithList.listId,
      name: cardWithList.name,
    });
  };

  return (
    <div className="flex gap-x-3 items-start w-full">
      <AlignLeft className="mt-0.5 size-5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold mb-2 text-neutral-700">Description</p>
        {isEditing ? (
          <Form {...form}>
            <form
              className="space-y-2"
              onSubmit={form.handleSubmit(onSubmit)}
              ref={formRef}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormTextArea
                    {...field}
                    className="mt-2 w-full"
                    id="description"
                    placeholder="Add a description"
                    ref={textAreaRef}
                  />
                )}
              />
              <div className="flex gap-x-2 items-center">
                <FormSubmit disabled={updateCard.isPending}>
                    Save
                </FormSubmit>
                <Button 
                onClick={disableEditing}
                size="sm"
                type="button"
                variant="ghost"
                ></Button>
              </div>
            </form>
          </Form>
        ) : null}
      </div>
    </div>
  );
};
