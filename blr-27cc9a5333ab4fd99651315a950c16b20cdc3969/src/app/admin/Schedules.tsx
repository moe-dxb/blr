'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const timezones = ['UTC', 'Europe/London', 'Asia/Dubai', 'Asia/Kolkata', 'America/New_York'];
const weekdays = [
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
  { id: 7, name: 'Sun' },
];

export default function SchedulesAdmin() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [tz, setTz] = useState<string>('UTC');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (!db) return;
    const fdb = db!;
    (async () => {
      let q = query(collection(fdb, 'users'), orderBy('name'));
      if (role === 'Manager' && user) {
        q = query(collection(fdb, 'users'), where('managerId', '==', user.uid), orderBy('name'));
      }
      const snap = await getDocs(q);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [role, user?.uid]);

  const toggleDay = (id: number) => {
    setWorkDays((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    if (!db || !selectedUser) return;
    const fdb = db!;
    try {
      await setDoc(
        doc(fdb, 'schedules', selectedUser),
        { userId: selectedUser, timezone: tz, startTime, endTime, workDays, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      toast({ title: 'Saved schedule' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message || 'Could not save', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Manage Schedules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Employee</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email || u.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Timezone</Label>
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger>
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {weekdays.map((d) => (
            <Button key={d.id} variant={workDays.includes(d.id) ? 'default' : 'outline'} onClick={() => toggleDay(d.id)}>
              {d.name}
            </Button>
          ))}
        </div>
        <Button onClick={save} disabled={!selectedUser}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}