import { Button } from "../ui/button";
interface FormSubmitProps {
    children: string;
}

export const FormSubmit = ({ children }: FormSubmitProps) => (
    <Button>{children}</Button>
)