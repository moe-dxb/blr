
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Book } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/20">
       <div className="absolute top-8 left-8 flex items-center gap-2">
           <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <Book className="h-6 w-6" />
          </div>
           <h1 className="text-xl font-headline font-semibold text-primary">
            BLR WORLD HUB
          </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome back!</CardTitle>
          <CardDescription>
            Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john.doe@blr.com" defaultValue="john.doe@blr.com" required />
             <p className="text-xs text-muted-foreground px-1">
                Hint: Use `new.user@blr.com` to see the onboarding flow.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" defaultValue="••••••••••••" required />
          </div>
        </CardContent>
        <CardContent>
          <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
        </CardContent>
      </Card>
    </div>
  )
}
