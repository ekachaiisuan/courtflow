import { forwardRef } from "react";
import { FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  id: string;
  label?: string;
  name?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  value?: string;
}
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      id,
      label,
      name,
      onBlur,
      onChange,
      onKeyDown,
      placeholder,
      required,
      value,
    },
    ref,
  ) => (
    <FormItem>
      {label ? (
        <FormLabel className="font-semibold text-neutral-700 text-xs">
          {label}
        </FormLabel>
      ) : null}
      <Input
        className={cn("h-7 px-2 py-1 text-sm", className)}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onChange={(e)=>onChange?.(e.target.value)}
        placeholder={placeholder}
        ref={ref}
        required={required}
        value={value}
      />
    </FormItem>
  ),
);

FormInput.displayName = "FormInput";
