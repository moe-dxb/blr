
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the data and then redirect.
    router.push("/dashboard");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Welcome to BLR WORLD HUB!</CardTitle>
          <CardDescription>Please complete your profile to continue. This information is required to set up your account properly.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="Your full name" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title / Role</Label>
                        <Input id="job-title" placeholder="e.g., Software Engineer" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select required>
                        <SelectTrigger id="department">
                            <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="human-resources">Human Resources</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="manager">Reporting Manager</Label>
                    <Select required>
                        <SelectTrigger id="manager">
                            <SelectValue placeholder="Select your direct manager" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Aisha Khan</SelectItem>
                            <SelectItem value="5">John Doe</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Create a New Password</Label>
                    <Input id="password" type="password" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" required />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full">Complete Profile & Enter</Button>
            </CardFooter>
        </form>
      </Card>
    </main>
  );
}
