
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const feedbackSchema = z.object({
  subject: z.string().nonempty("Subject is required").min(5, "Subject must be at least 5 characters"),
  type: z.enum(["suggestion", "concern", "compliment"]),
  message: z.string().nonempty("Message is required").min(10, "Message must be at least 10 characters"),
  name: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FeedbackFormData>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            type: "suggestion"
        }
    });

    const onSubmit = async (data: FeedbackFormData) => {
        try {
            await addDoc(collection(db, "feedback"), {
                ...data,
                submittedAt: serverTimestamp(),
                userId: user?.uid, // Optional: link feedback to user if logged in
                userName: data.name || user?.displayName || "Anonymous"
            });
            
            toast({ title: "Feedback Submitted", description: "Thank you for your valuable input!" });
            reset();
        } catch (error) {
            console.error("Feedback submission error: ", error);
            toast({ title: "Submission Failed", description: "Could not submit your feedback.", variant: "destructive" });
        }
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Feedback & Suggestions</h1>
            <p className="text-muted-foreground">
            We value your input! Share your ideas, feedback, and suggestions with us.
            </p>
        </CardHeader>
      </Card>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
            <CardTitle className="font-headline">Submit Your Feedback</CardTitle>
            <CardDescription>
                Your submission can be anonymous if you choose.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Idea for improving team meetings" {...register("subject")} />
                {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>Type of Feedback</Label>
                 <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="suggestion" id="r1" /><Label htmlFor="r1">Suggestion</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="concern" id="r2" /><Label htmlFor="r2">Concern</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="compliment" id="r3" /><Label htmlFor="r3">Compliment</Label></div>
                        </RadioGroup>
                    )}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Describe your feedback in detail..." rows={6} {...register("message")}/>
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Your Name (Optional)</Label>
                <Input id="name" placeholder={user?.displayName || "John Doe"} {...register("name")} />
            </div>
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
            </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
