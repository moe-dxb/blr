'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const timezones = [ "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney", "Asia/Kolkata" ];
const headquarters = ["Dubai Office", "Osaka Office", "Doha Office", "New York Office", "London Office"];

const profileSchema = z.object({
  name: z.string().nonempty("Name is required."),
  email: z.string().email(),
  headquarter: z.string().nonempty("Please select your headquarter office."),
  timezone: z.string().nonempty("Please select your timezone."),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { isSubmitting, isLoading }, setValue } = useForm<ProfileFormData>({
      resolver: zodResolver(profileSchema),
      defaultValues: { name: '', email: '', headquarter: '', timezone: '' }
  });

  useEffect(() => {
    if (user && db) {
      const fetchUserData = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          reset({
            name: userData.name || user.displayName || '',
            email: userData.email || user.email || '',
            headquarter: userData.headquarter || '',
            timezone: userData.timezone || '',
          });
        }
      };
      fetchUserData();
    }
  }, [user, reset]);

  const onSaveChanges = async (data: ProfileFormData) => {
    if (!user || !db) return;
    try {
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        toast({ title: "Success!", description: "Your profile has been updated." });
    } catch (error) {
        toast({ title: "Error", description: "Could not save your profile.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
       <Card>
           <CardHeader>
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your personal information and portal settings.</p>
           </CardHeader>
       </Card>
      <Card>
        <form onSubmit={handleSubmit(onSaveChanges)}>
            <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Controller name="name" control={control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...field} />
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                )} />
                <Controller name="email" control={control} render={({ field }) => (
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" {...field} disabled />
                    </div>
                )} />

            <div className="grid md:grid-cols-2 gap-4">
                 <Controller name="headquarter" control={control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                        <Label htmlFor="headquarter">Headquarter</Label>
                        <Select onValueChange={(value) => setValue('headquarter', value)} value={field.value}><SelectTrigger><SelectValue placeholder="Select office..." /></SelectTrigger>
                        <SelectContent>{headquarters.map(hq => <SelectItem key={hq} value={hq}>{hq}</SelectItem>)}</SelectContent></Select>
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                 )} />
                 <Controller name="timezone" control={control} render={({ field, fieldState }) => (
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select onValueChange={(value) => setValue('timezone', value)} value={field.value}><SelectTrigger><SelectValue placeholder="Select timezone..." /></SelectTrigger>
                        <SelectContent>{timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent></Select>
                        {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </div>
                 )} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
            </CardContent>
        </form>
      </Card>
    </div>
  );
}