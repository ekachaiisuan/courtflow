import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({ name: z.string().min(1, { message: "Name must not be empty" }) });

type FormSchema = z.infer<typeof formSchema>;

export const BoardCreateForm = () => {
    const  form = useForm<FormSchema>({
        defaultValues: {
            name: "",
        },
        resolver: zodResolver(formSchema),
    })
    const onSubmit = (values: FormSchema) => {
        console.log(values);
    }
  
};