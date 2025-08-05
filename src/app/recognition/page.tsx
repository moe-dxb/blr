'use client';

import { useState, useEffect } from 'react';
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
import { ThumbsUp, Trophy } from "lucide-react";

const allEmployees = [
    { id: 1, name: 'Aisha Khan', email: 'aisha.khan@blr.com', avatar: "https://placehold.co/100x100.png", hint: "woman face" },
    { id: 2, name: 'Ben Carter', email: 'ben.carter@blr.com', avatar: "https://placehold.co/100x100.png", hint: "man face" },
    { id: 3, name: 'Carla Rodriguez', email: 'carla.rodriguez@blr.com', avatar: "https://placehold.co/100x100.png", hint: "woman portrait" },
    { id: 4, name: 'David Chen', email: 'david.chen@blr.com', avatar: "https://placehold.co/100x100.png", hint: "man portrait" },
    { id: 5, name: 'Emily White', email: 'emily.white@blr.com', avatar: "https://placehold.co/100x100.png", hint: "woman professional" },
];

const initialRecognitions = [
  {
    id: 1,
    recognizer: "Ben Carter",
    recognized: "Aisha Khan",
    message: "Aisha's leadership on the new feature launch was incredible. She kept the team focused and motivated, and her technical expertise was invaluable in overcoming some tough challenges.",
    avatar: "https://placehold.co/100x100.png",
    hint: "man face",
    date: "2024-07-15",
  },
  {
    id: 2,
    recognizer: "Emily White",
    recognized: "David Chen",
    message: "Huge thanks to David for his insightful product feedback. His detailed analysis helped us prioritize the most impactful features for our users.",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman professional",
    date: "2024-07-10",
  },
  {
    id: 3,
    recognizer: "David Chen",
    recognized: "Aisha Khan",
    message: "Aisha is always willing to help out, a true team player!",
    avatar: "https://placehold.co/100x100.png",
    hint: "man portrait",
    date: "2024-06-20",
  },
];

const getQuarter = (date: Date) => {
    return Math.floor(date.getMonth() / 3) + 1;
}

export default function RecognitionPage() {
    const [recognitions, setRecognitions] = useState(initialRecognitions);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [currentQuarter, setCurrentQuarter] = useState(0);

    useEffect(() => {
        const now = new Date();
        const quarter = getQuarter(now);
        setCurrentQuarter(quarter);

        const quarterlyRecognitions = recognitions.filter(r => getQuarter(new Date(r.date)) === quarter);

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
                    avatar: employee?.avatar,
                    hint: employee?.hint,
                }
            });
        setLeaderboard(sortedLeaderboard);

    }, [recognitions]);


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
                <CardHeader>
                <CardTitle className="font-headline">Give Recognition</CardTitle>
                <CardDescription>
                    Acknowledge a team member's great work.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="employee-email">Recognize a Colleague (by Email)</Label>
                    <Input id="employee-email" placeholder="e.g., aisha.khan@blr.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                    id="message"
                    placeholder="Why are you recognizing them?"
                    rows={5}
                    />
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Submit Recognition
                </Button>
                </CardFooter>
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
                                    <p className="text-sm text-muted-foreground">{entry.score} recognitions</p>
                                </div>
                             </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center">No recognitions yet this quarter.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>


        <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold font-headline">Recognition Feed</h2>
            {recognitions.map((rec) => (
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
                        <span className="text-xs text-muted-foreground">{rec.date}</span>
                     </div>
                     <p className="text-sm text-muted-foreground mt-1">{rec.message}</p>
                   </div>
                   <div className="text-primary flex items-center gap-1 text-sm font-semibold">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Kudos</span>
                   </div>
                 </CardContent>
               </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
