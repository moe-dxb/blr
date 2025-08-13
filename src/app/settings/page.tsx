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

type ProfileFormData = z.infer&lt;typeof profileSchema&gt;;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { isSubmitting, isLoading }, setValue } = useForm&lt;ProfileFormData&gt;({
      resolver: zodResolver(profileSchema),
      defaultValues: { name: '', email: '', headquarter: '', timezone: '' }
  });

  useEffect(() =&gt; {
    if (user &amp;&amp; db) {
      const fetchUserData = async () =&gt; {
        const userRef = doc(db!, 'users', user.uid);
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

  const onSaveChanges = async (data: ProfileFormData) =&gt; {
    if (!user || !db) return;
    try {
        await setDoc(doc(db!, 'users', user.uid), data, { merge: true });
        toast({ title: "Success!", description: "Your profile has been updated." });
    } catch (error) {
        toast({ title: "Error", description: "Could not save your profile.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return &lt;div className="flex justify-center items-center h-64"&gt;&lt;Loader2 className="h-8 w-8 animate-spin" /&gt;&lt;/div&gt;;
  }

  return (
    &lt;div className="space-y-6"&gt;
       &lt;Card&gt;
           &lt;CardHeader&gt;
                &lt;h1 className="text-3xl font-bold font-headline"&gt;Settings&lt;/h1&gt;
                &lt;p className="text-muted-foreground"&gt;Manage your personal information and portal settings.&lt;/p&gt;
           &lt;/CardHeader&gt;
       &lt;/Card&gt;
      &lt;Card&gt;
        &lt;form onSubmit={handleSubmit(onSaveChanges)}&gt;
            &lt;CardHeader&gt;
            &lt;CardTitle&gt;My Profile&lt;/CardTitle&gt;
            &lt;CardDescription&gt;Update your personal details here.&lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent className="space-y-4"&gt;
                &lt;Controller name="name" control={control} render={({ field, fieldState }) =&gt; (
                    &lt;div className="space-y-2"&gt;
                        &lt;Label htmlFor="name"&gt;Full Name&lt;/Label&gt;
                        &lt;Input id="name" {...field} /&gt;
                        {fieldState.error &amp;&amp; &lt;p className="text-sm text-destructive"&gt;{fieldState.error.message}&lt;/p&gt;}
                    &lt;/div&gt;
                )} /&gt;
                &lt;Controller name="email" control={control} render={({ field }) =&gt; (
                    &lt;div className="space-y-2"&gt;
                        &lt;Label htmlFor="email"&gt;Email Address&lt;/Label&gt;
                        &lt;Input id="email" {...field} disabled /&gt;
                    &lt;/div&gt;
                )} /&gt;

            &lt;div className="grid md:grid-cols-2 gap-4"&gt;
                 &lt;Controller name="headquarter" control={control} render={({ field, fieldState }) =&gt; (
                    &lt;div className="space-y-2"&gt;
                        &lt;Label htmlFor="headquarter"&gt;Headquarter&lt;/Label&gt;
                        &lt;Select onValueChange={(value) =&gt; setValue('headquarter', value)} value={field.value}&gt;&lt;SelectTrigger&gt;&lt;SelectValue placeholder="Select office..." /&gt;&lt;/SelectTrigger&gt;
                        &lt;SelectContent&gt;{headquarters.map(hq =&gt; &lt;SelectItem key={hq} value={hq}&gt;{hq}&lt;/SelectItem&gt;)}&lt;/SelectContent&gt;&lt;/Select&gt;
                        {fieldState.error &amp;&amp; &lt;p className="text-sm text-destructive"&gt;{fieldState.error.message}&lt;/p&gt;}
                    &lt;/div&gt;
                 )} /&gt;
                 &lt;Controller name="timezone" control={control} render={({ field, fieldState }) =&gt; (
                    &lt;div className="space-y-2"&gt;
                        &lt;Label htmlFor="timezone"&gt;Timezone&lt;/Label&gt;
                        &lt;Select onValueChange={(value) =&gt; setValue('timezone', value)} value={field.value}&gt;&lt;SelectTrigger&gt;&lt;SelectValue placeholder="Select timezone..." /&gt;&lt;/SelectTrigger&gt;
                        &lt;SelectContent&gt;{timezones.map(tz =&gt; &lt;SelectItem key={tz} value={tz}&gt;{tz}&lt;/SelectItem&gt;)}&lt;/SelectContent&gt;&lt;/Select&gt;
                        {fieldState.error &amp;&amp; &lt;p className="text-sm text-destructive"&gt;{fieldState.error.message}&lt;/p&gt;}
                    &lt;/div&gt;
                 )} /&gt;
            &lt;/div&gt;
            &lt;Button type="submit" disabled={isSubmitting}&gt;
                {isSubmitting &amp;&amp; &lt;Loader2 className="mr-2 h-4 w-4 animate-spin" /&gt;}
                Save Changes
            &lt;/Button&gt;
            &lt;/CardContent&gt;
        &lt;/form&gt;
      &lt;/Card&gt;
    &lt;/div&gt;
  );
}