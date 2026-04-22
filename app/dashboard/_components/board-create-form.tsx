import { FormInput } from "@/components/forms/form-input";
import { FormSubmit } from "@/components/forms/form-submit";
import { Form, FormField } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name must not be empty" }),
});

type FormSchema = z.infer<typeof formSchema>;

export const BoardCreateForm = () => {
  const form = useForm<FormSchema>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(formSchema),
  });
  const onSubmit = (values: FormSchema) => {
    console.log(values);
  };
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInput {...field} id="name" label="Board Name" />
          )}
        />
        <FormSubmit>Create New</FormSubmit>
      </form>
    </Form>
  );
};
