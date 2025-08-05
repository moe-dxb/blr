
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, Trophy, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    hint?: string;
}

interface Recognition {
    id: string;
    recognizer: string;
    recognized: string;
    message: string;
    date: any; // Firestore timestamp
    avatar?: string;
    hint?: string;
}

const getQuarter = (date: Date) => {
    return Math.floor(date.getMonth() / 3) + 1;
}

// Assuming the logged-in user is 'John Doe' for prototype purposes
const CURRENT_USER_NAME = "John Doe";

export default function RecognitionPage() {
    const [allEmployees, setAllEmployees] = useState<User[]>([]);
    const [recognitions, setRecognitions] = useState<Recognition[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [currentQuarter, setCurrentQuarter] = useState(0);
    const [loading, setLoading] = useState(true);
    const [newRecognition, setNewRecognition] = useState({ email: '', message: '' });
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch All Users for leaderboard avatars
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setAllEmployees(userList);

            // Fetch Recognitions
            const recognitionsCollection = collection(db, "recognitions");
            const qRecs = query(recognitionsCollection, orderBy("date", "desc"));
            const recSnapshot = await getDocs(qRecs);
            const recList = recSnapshot.docs.map(doc => {
                 const data = doc.data();
                 const recognizerEmployee = userList.find(u => u.name === data.recognizer);
                 return {
                     id: doc.id,
                     ...data,
                     avatar: `https://placehold.co/100x100.png`,
                     hint: 'person face'
                 } as Recognition
            });
            setRecognitions(recList);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ title: "Error", description: "Failed to fetch data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const now = new Date();
        const quarter = getQuarter(now);
        setCurrentQuarter(quarter);

        if (recognitions.length === 0) {
            setLeaderboard([]);
            return;
        }

        const quarterlyRecognitions = recognitions.filter(r => {
            const recDate = r.date?.toDate();
            return recDate && getQuarter(recDate) === quarter;
        });

        const scores = quarterlyRecognitions.reduce((acc, rec) => {
            acc[rec.recognized] = (acc[rec.recognized] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedLeaderboard = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .map(([name, score]) => {
                const employee = allEmployees.find(e => e.name === name);
                return {
                    name,
                    score,
                    avatar: `https://placehold.co/100x100.png`,
                    hint: 'person face',
                }
            });
        setLeaderboard(sortedLeaderboard);

    }, [recognitions, allEmployees]);

    const handleRecognitionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRecognition.email || !newRecognition.message) {
            toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive"});
            return;
        }

        const recognizedEmployee = allEmployees.find(u => u.email === newRecognition.email);
        if (!recognizedEmployee) {
             toast({ title: "User Not Found", description: "Could not find an employee with that email.", variant: "destructive"});
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "recognitions"), {
                recognizer: CURRENT_USER_NAME,
                recognized: recognizedEmployee.name,
                message: newRecognition.message,
                date: serverTimestamp(),
            });
            toast({ title: "Recognition Sent!", description: `You've recognized ${recognizedEmployee.name}.`});
            setNewRecognition({ email: '', message: '' });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error submitting recognition:", error);
            toast({ title: "Error", description: "Could not send recognition.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Peer Recognition</h1>
        <p className="text-muted-foreground">
          Recognize your colleagues for their hard work and contributions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <form onSubmit={handleRecognitionSubmit}>
                <CardHeader>
                <CardTitle className="font-headline">Give Recognition</CardTitle>
                <CardDescription>
                    Acknowledge a team member's great work.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="employee-email">Recognize a Colleague (by Email)</Label>
                    <Input id="employee-email" placeholder="e.g., aisha.khan@blr.com" value={newRecognition.email} onChange={e => setNewRecognition({...newRecognition, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                    id="message"
                    placeholder="Why are you recognizing them?"
                    rows={5}
                    value={newRecognition.message} 
                    onChange={e => setNewRecognition({...newRecognition, message: e.target.value})}
                    />
                </div>
                </CardContent>
                <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className="mr-2 h-4 w-4" />}
                    Submit Recognition
                </Button>
                </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-primary" />
                        Q{currentQuarter} Leaderboard
                    </CardTitle>
                    <CardDescription>Top recognized employees this quarter.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                         </div>
                    ) : (
                        <div className="space-y-4">
                            {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-4">
                                    <span className="font-bold text-lg w-6">{index + 1}</span>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={entry.avatar} data-ai-hint={entry.hint} />
                                        <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{entry.name}</p>
                                        <p className="text-sm text-muted-foreground">{entry.score} recognition{entry.score > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center">No recognitions yet this quarter.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>


        <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold font-headline">Recognition Feed</h2>
             {loading ? (
                 <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
            ) : recognitions.length > 0 ? recognitions.map((rec) => (
                 <Card key={rec.id}>
                 <CardContent className="p-4 flex gap-4 items-start">
                   <Avatar className="h-12 w-12">
                     <AvatarImage src={rec.avatar} data-ai-hint={rec.hint}/>
                     <AvatarFallback>{rec.recognizer.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">
                        {rec.recognizer}{" "}
                        <span className="font-normal text-muted-foreground">
                            recognized
                        </span>{" "}
                        {rec.recognized}
                        </p>
                        <span className="text-xs text-muted-foreground">{rec.date?.toDate().toLocaleDateString()}</span>
                     </div>
                     <p className="text-sm text-muted-foreground mt-1">{rec.message}</p>
                   </div>
                   <div className="text-primary flex items-center gap-1 text-sm font-semibold">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Kudos</span>
                   </div>
                 </CardContent>
               </Card>
            )) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No recognitions have been given yet. Be the first!
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
