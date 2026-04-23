import {  XCircleIcon } from "lucide-react"

interface FormErrorsProps {
  errors?: Record<string,string[] | undefined>
  id: string
}
export const FormErrors = ({ errors, id }: FormErrorsProps) => 
    errors? (
        <div className="mt-2 text-rose-500 text-xs" id={`${id}-error`}>
            {errors[id]?.map(error => (
                <div className="bg-rose-500/10 border border-rose-500 flex font-medium items-center p-2 rounded-sm" key={error}>
                    <XCircleIcon className="size-4 mr-2" />
                    {error}
                </div>
            ))}
        </div>
    ) : null