'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/firebase/callables';

interface Announcement { id: string; title: string; bodyRich: string; priority?: 'low'|'normal'|'high'; publishedAt?: Timestamp; expiresAt?: Timestamp; requiresAck?: boolean; }

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!db) return;
    const fdb = db!;
    const q = query(collection(fdb, 'announcements'), orderBy('publishedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows as Announcement[]);
    });
    return () => unsub();
  }, []);

  const handleAck = async (id: string) => {
    await api.acknowledgeAnnouncement(id);
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