'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSubmit } from '@/components/forms/form-submit';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { useTRPC } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { RefObject, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name must not be empty' }),
});

type FormSchema = z.infer<typeof formSchema>;
export const ListForm = () => {
  const form = useForm<FormSchema>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(formSchema),
  });
  const params = useParams<{ boardId: string }>();
  const boardId = Array.isArray(params.boardId)
    ? params.boardId[0]
    : params.boardId;
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') disableEditing();
  };
  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      form.setFocus('name');
    }, 0);
  };

  useEventListener('keydown', onKeyDown);
  useOnClickOutside(formRef as RefObject<HTMLElement>, disableEditing);

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const crearteList = useMutation(
    trpc.list.createList.mutationOptions({
      onError: (error) =>
        toast('Error creating list', {
          description: error.message,
        }),
      onSuccess: () => {
        disableEditing();
        form.reset();
        queryClient.invalidateQueries({
          queryKey: trpc.pages.boardIdPage.queryKey({ boardId: boardId }),
        });
      },
    }),
  );

  const onSubmit = (data: FormSchema) =>
    crearteList.mutate({ boardId, name: data.name });

  return isEditing ? (
    <li className="h-full select-none shrink-0 w-68">
      <Form {...form}>
        <form
          className="bg-white p-3 rounded-md shadow-md space-y-4 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
          ref={formRef}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInput
                {...field}
                className="border-transparent focus:border-input font-medium h-7
            hover:border-input px-2 py-1 text-sm transition"
                id="name"
                placeholder="Enter list name"
              />
            )}
          />
          <div className="flex gap-x1 items-center">
            <FormSubmit className="w-auto" disabled={crearteList.isPending}>
              {crearteList.isPending ? 'Adding...' : 'Add List'}
            </FormSubmit>
            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="size-4" />
            </Button>
          </div>
        </form>
      </Form>
    </li>
  ) : (
    <li className='h-full select-none shrink-0 w-68'>
      <button className='bg-gray-100 flex font-medium hover:bg-black/10 items-center p-3 rounded-md text-sm transition w-full'
        onClick={enableEditing}>
        <PlusIcon className='mr-2 size-4' />
        Add a list
      </button>
    </li>
  );
};
