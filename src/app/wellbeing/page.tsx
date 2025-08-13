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
import { collection, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, Query } from 'firebase/firestore';
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

    const announcementsQuery = useMemo(() =&gt; {
        if (!db) return null;
        return query(collection(db, "wellbeingAnnouncements"), orderBy("date", "desc")) as Query&lt;Announcement&gt;
    }, []);
    const { data: announcements, loading: loadingAnnouncements } = useFirestoreSubscription&lt;Announcement&gt;({ query: announcementsQuery });

    const eventsQuery = useMemo(() =&gt; {
        if (!db) return null;
        return query(collection(db, "wellbeingEvents"), orderBy("date", "asc")) as Query&lt;WellbeingEvent&gt;
    }, []);
    const { data: events, loading: loadingEvents } = useFirestoreSubscription&lt;WellbeingEvent&gt;({ query: eventsQuery });
    
    const handleRsvp = useCallback(async (eventId: string, isAttending: boolean) =&gt; {
        if(!user || !db) return;
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
    &lt;div className="space-y-6"&gt;
      &lt;Card&gt;
          &lt;CardHeader&gt;
            &lt;h1 className="text-3xl font-bold font-headline"&gt;Employee Wellbeing&lt;/h1&gt;
            &lt;p className="text-muted-foreground"&gt;Resources, events, and announcements to support your health and happiness.&lt;/p&gt;
          &lt;/CardHeader&gt;
      &lt;/Card&gt;

      &lt;div className="grid md:grid-cols-2 gap-8 items-start"&gt;
        &lt;div className="space-y-4"&gt;
            &lt;h2 className="text-2xl font-bold font-headline"&gt;Upcoming Events&lt;/h2&gt;
            {loadingEvents &amp;&amp; &lt;p&gt;Loading events...&lt;/p&gt;}
            {events?.map((event) =&gt; {
                const isUserRsvpd = user ? event.rsvps.includes(user.uid) : false;
                return (
                    &lt;Card key={event.id}&gt;
                        &lt;CardHeader&gt;
                            &lt;CardTitle className="font-headline"&gt;{event.title}&lt;/CardTitle&gt;
                            &lt;CardDescription className="flex items-center gap-2 pt-1"&gt;&lt;Calendar className="h-4 w-4"/&gt;{new Date(event.date).toLocaleDateString()}&lt;/CardDescription&gt;
                        &lt;/CardHeader&gt;
                        &lt;CardContent&gt;
                            &lt;p className="text-sm text-muted-foreground"&gt;{event.description}&lt;/p&gt;
                            &lt;div className="flex items-center gap-2 text-sm text-muted-foreground mt-4"&gt;&lt;Users className="h-4 w-4" /&gt;&lt;span&gt;{event.rsvps.length} attending&lt;/span&gt;&lt;/div&gt;
                        &lt;/CardContent&gt;
                        {user &amp;&amp; (
                            &lt;CardFooter className="gap-2"&gt;
                                &lt;Button className="flex-1" variant={isUserRsvpd ? 'default' : 'outline'} onClick={() =&gt; handleRsvp(event.id, !isUserRsvpd)}&gt;
                                    &lt;CheckCircle className="mr-2 h-4 w-4"/&gt; {isUserRsvpd ? 'Attending' : 'RSVP'}
                                &lt;/Button&gt;
                            &lt;/CardFooter&gt;
                        )}
                    &lt;/Card&gt;
                )
            })}
        &lt;/div&gt;
        &lt;div className="space-y-4"&gt;
            &lt;h2 className="text-2xl font-bold font-headline"&gt;Announcements&lt;/h2&gt;
            {loadingAnnouncements &amp;&amp; &lt;p&gt;Loading announcements...&lt;/p&gt;}
            {announcements?.map((announcement) =&gt; (
                 &lt;Card key={announcement.id}&gt;
                    &lt;CardContent className="p-4 flex gap-4 items-start"&gt;
                        &lt;div className="bg-primary/10 text-primary p-3 rounded-full mt-1"&gt;&lt;Bell className="h-5 w-5" /&gt;&lt;/div&gt;
                        &lt;div className="flex-1"&gt;
                            &lt;div className="flex justify-between items-center"&gt;
                                &lt;p className="font-semibold"&gt;{announcement.title}&lt;/p&gt;
                                &lt;Badge variant="secondary"&gt;{new Date(announcement.date).toLocaleDateString()}&lt;/Badge&gt;
                            &lt;/div&gt;
                            &lt;p className="text-sm text-muted-foreground mt-1"&gt;{announcement.content}&lt;/p&gt;
                        &lt;/div&gt;
                    &lt;/CardContent&gt;
                 &lt;/Card&gt;
            ))}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}