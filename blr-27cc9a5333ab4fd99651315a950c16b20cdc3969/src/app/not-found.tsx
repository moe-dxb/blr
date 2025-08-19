export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-headline font-bold">Page not found</h2>
        <p className="text-muted-foreground">The page you are looking for does not exist or has been moved.</p>
        <a href="/dashboard" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}