
'use client'

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, ThumbsUp } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const recognitionTypes = [
  "Team Player",
  "Innovation",
  "Customer Service",
  "Leadership",
];

const teamMembers = [
    { id: 'u1', name: 'Alice Johnson', avatar: '/avatars/01.png' },
    { id: 'u2', name: 'Bob Williams', avatar: '/avatars/02.png' },
    { id: 'u3', name: 'Charlie Brown', avatar: '/avatars/03.png' },
];

const recentRecognitions = [
  { id: 'r1', from: 'Alice Johnson', to: 'Bob Williams', type: 'Team Player', message: 'Great job on the Q3 report!', likes: 5 },
  { id: 'r2', from: 'Charlie Brown', to: 'Alice Johnson', type: 'Innovation', message: 'The new workflow is a game-changer.', likes: 12 },
];


export default function RecognitionPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState('');
  const [recognitionType, setRecognitionType] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      from: user?.displayName,
      to: selectedUser,
      type: recognitionType,
      message,
    });
    // Reset form
    setSelectedUser('');
    setRecognitionType('');
    setMessage('');
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Give Recognition</CardTitle>
            <CardDescription>Acknowledge a colleague&apos;s hard work.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a colleague" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
               <Select value={recognitionType} onValueChange={setRecognitionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recognition type" />
                </SelectTrigger>
                <SelectContent>
                  {recognitionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Write a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" className="w-full">Submit</Button>
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
            {recentRecognitions.map(rec => (
              <div key={rec.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png`} />
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
                        <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {rec.likes}
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
