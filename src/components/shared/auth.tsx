
'use client';

import { useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase/firebase';

let auth: Auth | null = null;
if (app) {
  auth = getAuth(app);
}

const ALLOWED_DOMAIN = '@blr-world.com';

export function AuthComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = async () => {
    if (!auth) {
      toast({
        title: 'Error',
        description: 'Authentication service is not available.',
        variant: 'destructive',
      });
      return;
    }
    if (isSignUp) {
      if (!email.endsWith(ALLOWED_DOMAIN)) {
        toast({
          title: 'Invalid Email Domain',
          description: `Sorry, only emails from ${ALLOWED_DOMAIN} are allowed to register.`,
          variant: 'destructive',
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match.',
          variant: 'destructive',
        });
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Account Created',
          description: 'You have successfully signed up.',
        });
        router.push('/dashboard');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast({
          title: 'Sign Up Failed',
          description: message,
          variant: 'destructive',
        });
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signed In',
          description: 'You have successfully signed in.',
        });
        router.push('/dashboard');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast({
          title: 'Sign In Failed',
          description: message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
        toast({
            title: 'Error',
            description: 'Authentication service is not available.',
            variant: 'destructive',
        });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (!userEmail || !userEmail.endsWith(ALLOWED_DOMAIN)) {
        await auth.signOut();
        toast({
          title: 'Invalid Email Domain',
          description: `Sign-in with Google is only allowed for ${ALLOWED_DOMAIN} emails.`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Signed In with Google',
        description: 'You have successfully signed in.',
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Google Sign In Failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? `Create your account using a ${ALLOWED_DOMAIN} email.`
              : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="employee@blr-world.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleAuthAction}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
  );
}
