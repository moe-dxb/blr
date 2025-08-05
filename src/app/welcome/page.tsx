
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
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/firebase";
import { doc, setDoc } from 'firebase/firestore';
import React from "react";


export default function WelcomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    fullName: '',
    jobTitle: '',
    department: '',
    manager: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({ ...formData, [field]: value });
  };


  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        toast({
            title: "Password Mismatch",
            description: "The passwords you entered do not match.",
            variant: "destructive",
        });
        return;
    }
    
    // In a real app, this would also handle account creation in Firebase Auth
    // For this prototype, we'll create the user profile in Firestore
    const email = 'new.user@blr.com'; // Using the hinted email for this flow
    const userId = email.replace(/[@.]/g, '_'); // simple way to create a unique ID from email
    
    try {
        await setDoc(doc(db, "users", userId), {
            name: formData.fullName,
            email: email,
            role: 'Viewer', // Default role for new users
            department: formData.department,
            manager: formData.manager,
        });

        toast({
            title: "Profile Created!",
            description: "Your profile has been successfully created. Redirecting to dashboard...",
        });
        
        router.push("/dashboard");

    } catch (error) {
        console.error("Error creating user profile:", error);
        toast({
            title: "Error",
            description: "Could not create your profile. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Welcome to BLR WORLD HUB!</CardTitle>
          <CardDescription>Please complete your profile to continue. This information is required to set up your account properly.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" placeholder="Your full name" required onChange={handleChange} value={formData.fullName} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title / Role</Label>
                        <Input id="jobTitle" placeholder="e.g., Software Engineer" required onChange={handleChange} value={formData.jobTitle}/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select required onValueChange={handleSelectChange('department')} value={formData.department}>
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
                    <Select required onValueChange={handleSelectChange('manager')} value={formData.manager}>
                        <SelectTrigger id="manager">
                            <SelectValue placeholder="Select your direct manager" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Aisha Khan">Aisha Khan</SelectItem>
                            <SelectItem value="John Doe">John Doe</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" onChange={handleChange} value={formData.phone}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Create a New Password</Label>
                    <Input id="password" type="password" required onChange={handleChange} value={formData.password} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" required onChange={handleChange} value={formData.confirmPassword} />
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

    