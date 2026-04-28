'use client';
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorStateProps {
  actionText?: string;
  children?: React.ReactNode;
  className?: string;
  error?: Error;
  message?: string;
  onAction?: () => void;
  showDetails?: boolean;
  title?: string;
}

export const ErrorState = ({
  actionText = "Try again",
  children,
  className,
  error,
  message = "We having trouble loading this page.",
  onAction = () => window.location.reload(),
  showDetails = false,
  title = "Something went wrong",
}: ErrorStateProps) => (
  <div className="flex min-h-screen items-center justify-center p-2">
    <div className="w-full max-w-2xl">
      <div
        className={cn(
          "bg-background flex min-h-full flex-col items-center justify-center rounded-md p-4 text-center",
          className,
        )}
      >
        <div className="max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="bg-destructive/10 p-3 rounded-full">
              <AlertTriangleIcon className="size-10 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-2xl tracking-light">{title}</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
          {showDetails && error && (
              <div className="bg-muted max-h-40 overflow-auto p-4 rounded-md text-left text">
                <p className="font-medium">{error.name}:{error.message}</p>
                {error.stack && (
                  <pre className="mt-2 text-muted-foreground whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
          )}
          {children}
          <div className="flex justify-center">
            <Button onClick={onAction} variant="outline">
                <RefreshCwIcon className="mr-2 size-4" />
                {actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
