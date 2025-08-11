
'use client';

import { useMemo, useCallback } from 'react';
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
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
    id: string;
    title: string;
    date: string;
    content: string;
}

interface WellbeingEvent {
    id: string;
    title: string;
    date: string;
    description: string;
    rsvps: string[]; // Array of user IDs
}

export default function WellbeingPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const announcementsQuery = useMemo(() => query(collection(db, "wellbeingAnnouncements"), orderBy("date", "desc")), []);
    const { data: announcements, loading: loadingAnnouncements } = useFirestoreSubscription<Announcement>({ query: announcementsQuery });

    const eventsQuery = useMemo(() => query(collection(db, "wellbeingEvents"), orderBy("date", "asc")), []);
    const { data: events, loading: loadingEvents } = useFirestoreSubscription<WellbeingEvent>({ query: eventsQuery });
    
    const handleRsvp = useCallback(async (eventId: string, isAttending: boolean) => {
        if(!user) return;
        const eventRef = doc(db, "wellbeingEvents", eventId);
        try {
            await updateDoc(eventRef, {
                rsvps: isAttending ? arrayUnion(user.uid) : arrayRemove(user.uid)
            });
            toast({ title: "RSVP Updated", description: `You are now ${isAttending ? 'attending' : 'not attending'} the event.`});
        } catch (error) {
            toast({ title: "Error", description: "Could not update your RSVP.", variant: "destructive"});
        }
    }, [user, toast]);
  
  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Employee Wellbeing</h1>
            <p className="text-muted-foreground">Resources, events, and announcements to support your health and happiness.</p>
          </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Upcoming Events</h2>
            {loadingEvents && <p>Loading events...</p>}
            {events?.map((event) => {
                const isUserRsvpd = user ? event.rsvps.includes(user.uid) : false;
                return (
                    <Card key={event.id}>
                        <CardHeader>
                            <CardTitle className="font-headline">{event.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1"><Calendar className="h-4 w-4"/>{new Date(event.date).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4"><Users className="h-4 w-4" /><span>{event.rsvps.length} attending</span></div>
                        </CardContent>
                        {user && (
                            <CardFooter className="gap-2">
                                <Button className="flex-1" variant={isUserRsvpd ? 'default' : 'outline'} onClick={() => handleRsvp(event.id, !isUserRsvpd)}>
                                    <CheckCircle className="mr-2 h-4 w-4"/> {isUserRsvpd ? 'Attending' : 'RSVP'}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                )
            })}
        </div>
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Announcements</h2>
            {loadingAnnouncements && <p>Loading announcements...</p>}
            {announcements?.map((announcement) => (
                 <Card key={announcement.id}>
                    <CardContent className="p-4 flex gap-4 items-start">
                        <div className="bg-primary/10 text-primary p-3 rounded-full mt-1"><Bell className="h-5 w-5" /></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{announcement.title}</p>
                                <Badge variant="secondary">{new Date(announcement.date).toLocaleDateString()}</Badge>
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
