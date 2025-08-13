'use client';
import { useEffect, useState } from 'react';
import { db, app } from '@/lib/firebase/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { httpsCallable, getFunctions } from 'firebase/functions';

interface Announcement { id: string; title: string; bodyRich: string; priority?: 'low'|'normal'|'high'; publishedAt?: Timestamp; expiresAt?: Timestamp; requiresAck?: boolean; }

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'announcements'), orderBy('publishedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows as Announcement[]);
    });
    return () => unsub();
  }, []);

  const handleAck = async (id: string) => {
    if (!app) return;
    const ack = httpsCallable(getFunctions(app), 'acknowledgeAnnouncement');
    await ack({ id });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(a => (
        <Card key={a.id}>
          <CardHeader>
            <CardTitle className="font-headline">{a.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose" dangerouslySetInnerHTML={{ __html: a.bodyRich }} />
            {a.requiresAck && <Button className="mt-4" onClick={() => handleAck(a.id)}>Acknowledge</Button>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}