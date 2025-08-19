
'use client';

import { AuthComponent } from '@/components/shared/auth';
import { Book } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-primary/5 hidden lg:flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
            <div className="flex items-center gap-4 justify-center">
                <div className="p-3 bg-primary rounded-lg text-primary-foreground">
                    <Book className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-headline font-bold text-primary">
                    BLR WORLD HUB
                </h1>
            </div>
            <p className="mt-6 text-lg text-muted-foreground">
                Your one-stop portal for everything at BLR World. Access your dashboard, connect with colleagues, and discover new opportunities.
            </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <AuthComponent />
        </div>
      </div>
    </div>
  );
}
