
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, ThumbsUp, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, serverTimestamp, addDoc, doc, runTransaction, Query } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const recognitionSchema = z.object({
  recipientId: z.string().nonempty("Please select a colleague."),
  recognitionType: z.string().nonempty("Please select a recognition type."),
  message: z.string().nonempty("Message cannot be empty.").min(10, "Message should be at least 10 characters."),
});

type RecognitionFormData = z.infer<typeof recognitionSchema>;

interface User {
    id: string;
    name: string;
    avatar?: string;
}
interface Recognition {
    id: string;
    from: string;
    to: string;
    type: string;
    message: string;
    likes: number;
    fromAvatar?: string;
}

const recognitionTypes = [ "Team Player", "Innovation", "Customer Service", "Leadership", "Going Above & Beyond" ];

export default function RecognitionPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("name")) as Query<User>
  }, []);
  const { data: teamMembers, loading: loadingUsers } = useFirestoreSubscription<User>({ query: usersQuery });

  const recognitionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "recognitions"), orderBy("createdAt", "desc")) as Query<Recognition>
  }, []);
  const { data: recentRecognitions, loading: loadingRecs } = useFirestoreSubscription<Recognition>({ query: recognitionsQuery });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<RecognitionFormData>({
      resolver: zodResolver(recognitionSchema)
  });

  const onSubmit = async (data: RecognitionFormData) => {
      if(!user || !teamMembers || !db) return;
      
      const recipient = teamMembers.find(m => m.id === data.recipientId);
      if(!recipient) return;

      try {
          await addDoc(collection(db, "recognitions"), {
              from: user.displayName,
              to: recipient.name,
              fromId: user.uid,
              toId: recipient.id,
              fromAvatar: user.photoURL,
              type: data.recognitionType,
              message: data.message,
              likes: 0,
              createdAt: serverTimestamp()
          });
          toast({ title: "Success!", description: "Your recognition has been posted." });
          reset();
      } catch (error) {
          toast({ title: "Error", description: "Could not post recognition.", variant: "destructive"});
      }
  };
  
  const handleLike = async (id: string) => {
    if (!db) return;
    const recognitionRef = doc(db, "recognitions", id);
    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(recognitionRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }
            const newLikes = (sfDoc.data().likes || 0) + 1;
            transaction.update(recognitionRef, { likes: newLikes });
        });
    } catch (e) {
        console.error("Like transaction failed: ", e);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Give Recognition</CardTitle>
            <CardDescription>Acknowledge a colleague&apos;s hard work.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <Controller name="recipientId" control={control} render={({ field, fieldState }) => (
                   <>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select a colleague..." /></SelectTrigger>
                        <SelectContent>
                        {loadingUsers ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                            teamMembers?.filter(m => m.id !== user?.uid).map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                   </>
               )} />
              
               <Controller name="recognitionType" control={control} render={({ field, fieldState }) => (
                   <>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select recognition type" /></SelectTrigger>
                        <SelectContent>
                        {recognitionTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                   </>
               )} />
                
                <Controller name="message" control={control} render={({ field, fieldState }) => (
                    <>
                    <Textarea placeholder="Write a message..." {...field} />
                    {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </>
                )}/>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recognition Feed</CardTitle>
             <CardDescription>See who is being recognized.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingRecs && <Loader2 className="mx-auto animate-spin" />}
            {recentRecognitions?.map(rec => (
              <div key={rec.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Avatar>
                  <AvatarImage src={rec.fromAvatar} />
                  <AvatarFallback>{rec.from.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm">
                        <span className="font-semibold">{rec.from}</span> recognized <span className="font-semibold">{rec.to}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>{rec.type}</span>
                    </div>
                    <p className="mt-2 text-sm bg-muted p-3 rounded-lg">{rec.message}</p>
                     <div className="mt-2 flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleLike(rec.id)}>
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {rec.likes || 0}
                        </Button>
                    </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
