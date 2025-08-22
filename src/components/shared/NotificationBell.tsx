// src/components/shared/NotificationBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: { seconds: number, nanoseconds: number };
  readAt: any;
  link?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for real-time updates to notifications
  useEffect(() => {
    if (!user || !db) return;

    const q = query(
      collection(db, 'notifications'),
      where('toUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for real-time updates to the unread count on the user document
  useEffect(() => {
    if (!user || !db) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        setUnreadCount(doc.data()?.unreadNotifications || 0);
    });
    return () => unsub();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || !db || unreadCount === 0) return;
    
    // In a real app, this should be a batched write or a Cloud Function for large numbers
    const unreadNotifs = notifications.filter(n => !n.readAt);
    for (const notif of unreadNotifs) {
        const notifRef = doc(db, 'notifications', notif.id);
        await updateDoc(notifRef, { readAt: new Date() });
    }

    // Reset the counter on the user document
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { unreadNotifications: 0 });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">{unreadCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Notifications</h4>
            {unreadCount > 0 && 
              <Button variant="link" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4"/>Mark all as read
              </Button>
            }
        </div>
        <div className="space-y-4">
            {notifications.length > 0 ? notifications.map(n => (
                <div key={n.id} className={`p-2 rounded-md ${!n.readAt ? 'bg-blue-50' : ''}`}>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt.seconds * 1000))} ago</p>
                </div>
            )) : <p className="text-sm text-gray-500 text-center">No notifications yet.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
