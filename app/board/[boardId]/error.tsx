"use client";

import { Button } from "@/components/ui/button";

interface BoardIdErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BoardIdError({ error, reset }: BoardIdErrorProps) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Board not found
          </h2>
          <p className="text-sm text-muted-foreground">
            Network error. Please try again
          </p>
        </div>

        {error.digest ? (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        ) : null}

        <Button type="button" onClick={reset}>
          Retry
        </Button>
      </section>
    </main>
  );
}
