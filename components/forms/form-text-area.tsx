import { forwardRef, KeyboardEventHandler } from "react";
import { FormItem, FormLabel } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { FormErrors } from "./form-errors";

interface FormTextAreaProps {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  id: string;
  label?: string;
  name?: string;
  onBlur?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
  value?: string;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      errors,
      id,
      label,
      name,
      onBlur,
      onChange,
      onClick,
      onKeyDown,
      placeholder,
      required,
      value,
    },
    ref,
  ) => (
    <FormItem>
      {label ? (
        <FormLabel
          className="font-semibold text-neutral-700 text-xs"
          htmlFor={id}
        >
          {label}
        </FormLabel>
      ) : null}
      <Textarea
        className={cn("focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none resize-none ring-0 shadow-sm", className)}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        onClick={onClick}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        ref={ref}
        required={required}
        value={value}
      />
      <FormErrors errors={errors} id={id} />
    </FormItem>
  ),
);

FormTextArea.displayName = "FormTextArea";
