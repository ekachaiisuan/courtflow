import { FormInput } from "@/components/forms/form-input";
import { FormField } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithList } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Form, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormSchema = z.infer<typeof formSchema>;

interface HeaderProps {
  cardWithList: CardWithList;
}

export const Header = ({ cardWithList }: HeaderProps) => {
  const form = useForm<FormSchema>({
    defaultValues: {
      name: cardWithList.name,
    },
    resolver: zodResolver(formSchema),
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const updateCard = useMutation(
    trpc.card.updateCard.mutationOptions({
      onError: (error) =>
        toast("Failed to rename card", {
          description: error.message,
        }),
      onSuccess: () => {
        inputRef.current?.blur();
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({
            boardId: cardWithList.list.boardId,
          }),
        });
      },
    }),
  );
  const onSubmit = (formData: FormSchema) => {
    if (formData.name === cardWithList.name) return;
    updateCard.mutate({
      boardId: cardWithList.list.boardId,
      cardId: cardWithList.id,
      description: cardWithList.description ?? "",
      listId: cardWithList.listId,
      name: formData.name,
    });
  };
  return (
    <div className="flex gap-x-3 items-start mb-6 w-full">
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInput
                  {...field}
                  className="bg-transparent border-transparent focus-visible:bg-white focus-visible:border-input font-semibold-left-1.5 px-1 relative text-neutral-700 text-xl truncate w-[95%]"
                  id="name"
                  ref={inputRef}
                />
              )}
            />
          </form>
        </Form>
        <p className="text-muted-foreground text-sm">
              in list <span className="underline"></span>
        </p>
      </div>
    </div>
  );
};

export const HeaderSkeleton = () => (
    <div className="flex gap-x-3 items-start mb-6 w-full">
        <div className="w-full">
            <Skeleton className="bg-neutral-200 h-6 mb-1 w-24"></Skeleton>
            <Skeleton className="bg-neutral-200 h-4 w-12"></Skeleton>
        </div>
    </div>
)
