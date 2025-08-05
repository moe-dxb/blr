
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have authentication logic here.
    // This is a prototype simulation.
    if (email === 'new.user@blr.com') {
        // Simulate a new user who needs to complete their profile.
        router.push("/welcome");
    } else {
        // Simulate a regular user login.
        router.push("/dashboard");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                 <div className="p-3 bg-primary rounded-lg text-primary-foreground">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                 </div>
            </div>
          <CardTitle className="font-headline text-2xl">BLR WORLD HUB</CardTitle>
          <CardDescription>Welcome back! Please sign in to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@blr.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                 <p className="text-xs text-muted-foreground">Hint: Use 'new.user@blr.com' to see the onboarding flow.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required defaultValue="BLRWORLD@123" />
            </div>
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full">Sign In</Button>
            </CardFooter>
        </form>
      </Card>
    </main>
  );
}
