
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Asia/Kolkata"
];

const headquarters = ["Dubai Office", "Osaka Office", "Doha Office", "New York Office", "London Office"];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    headquarter: '',
    timezone: '',
  });

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setLoading(true);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData({
            name: userData.name || user.displayName || '',
            email: userData.email || user.email || '',
            headquarter: userData.headquarter || '',
            timezone: userData.timezone || '',
          });
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to save changes.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            ...formData,
        }, { merge: true });

        toast({
            title: "Success!",
            description: "Your profile information has been updated.",
        });
    } catch (error) {
        console.error("Error saving profile:", error);
        toast({
            title: "Error",
            description: "Could not save your profile. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and portal settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@company.com" disabled />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="headquarter">Headquarter</Label>
                <Select value={formData.headquarter} onValueChange={handleSelectChange('headquarter')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your office location" />
                    </SelectTrigger>
                    <SelectContent>
                        {headquarters.map(hq => <SelectItem key={hq} value={hq}>{hq}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={handleSelectChange('timezone')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
