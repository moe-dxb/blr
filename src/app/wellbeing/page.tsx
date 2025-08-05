
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CheckCircle, Users } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Mindfulness Monday Sessions",
    date: "2024-07-22",
    content: "Join our weekly guided mindfulness session to start your week with calm and focus. Every Monday at 9 AM.",
  },
  {
    id: 2,
    title: "New Healthy Snack Options",
    date: "2024-07-20",
    content: "We've updated the office pantry with a new range of healthy and delicious snacks. Enjoy!",
  },
];

const events = [
  {
    id: 1,
    title: "Annual Charity 5K Run",
    date: "2024-08-15",
    description: "Lace up your running shoes for a good cause! All fitness levels are welcome.",
    rsvps: 28,
  },
  {
    id: 2,
    title: "Financial Wellness Workshop",
    date: "2024-09-10",
    description: "Learn effective strategies for managing your finances and planning for the future with our expert-led workshop.",
    rsvps: 15,
  },
];

type RsvpStatus = 'going' | 'not-going' | null;

export default function WellbeingPage() {
    const [rsvps, setRsvps] = useState<Record<number, RsvpStatus>>({});

    const handleRsvp = (eventId: number, status: RsvpStatus) => {
        setRsvps(prev => ({
            ...prev,
            [eventId]: prev[eventId] === status ? null : status,
        }));
    };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Employee Wellbeing</h1>
        <p className="text-muted-foreground">
          Resources, events, and announcements to support your health and happiness.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Events Section */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Upcoming Events</h2>
            {events.map((event) => {
                const rsvpStatus = rsvps[event.id] || null;
                return (
                    <Card key={event.id}>
                        <CardHeader>
                            <CardTitle className="font-headline">{event.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <Calendar className="h-4 w-4"/>
                                {event.date}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                                <Users className="h-4 w-4" />
                                <span>{event.rsvps + (rsvpStatus === 'going' ? 1 : 0)} attending</span>
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                             <Button 
                                className="flex-1"
                                variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                                onClick={() => handleRsvp(event.id, 'going')}
                            >
                                <CheckCircle className="mr-2 h-4 w-4"/>
                                {rsvpStatus === 'going' ? 'Attending' : 'RSVP'}
                            </Button>
                            <Button 
                                className="flex-1"
                                variant={rsvpStatus === 'not-going' ? 'destructive' : 'outline'}
                                onClick={() => handleRsvp(event.id, 'not-going')}
                            >
                                Cannot Attend
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>

        {/* Announcements Section */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Announcements</h2>
            {announcements.map((announcement) => (
                 <Card key={announcement.id}>
                    <CardContent className="p-4 flex gap-4 items-start">
                        <div className="bg-primary/10 text-primary p-3 rounded-full mt-1">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{announcement.title}</p>
                                <Badge variant="secondary">{announcement.date}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        </div>
                    </CardContent>
                 </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

