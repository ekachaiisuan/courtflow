import { FieldErrors, FieldValues } from "react-hook-form";

export const formatFormErrors = <TFormSchema extends FieldValues>(
  errors: FieldErrors<TFormSchema>,
): Record<string, string[]> =>
  Object.keys(errors).reduce(
    (acc, key) => {
      const error = errors[key];
      if (error?.message && typeof error.message === "string") {
        acc[key] = [error.message];
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );

  export type FormattedErrors = Record<string, string[]>;