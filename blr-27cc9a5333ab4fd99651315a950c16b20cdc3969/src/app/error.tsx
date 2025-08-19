'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-2xl font-headline">Something went wrong</h2>
            <p className="text-muted-foreground break-all">{error?.message || 'Unknown error'}</p>
            <button
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground hover:opacity-90"
              onClick={() => reset()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}