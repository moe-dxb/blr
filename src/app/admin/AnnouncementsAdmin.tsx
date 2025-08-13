'use client';
import { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase/firebase';

export default function AnnouncementsAdmin() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'low'|'normal'|'high'>('normal');
  const [requiresAck, setRequiresAck] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: 'Missing', description: 'Title and body are required', variant: 'destructive' });
      return;
    }
    if (!app) {
      toast({ title: 'Not ready', description: 'App not initialized', variant: 'destructive' });
      return;
    }
    try {
      const fn = httpsCallable(getFunctions(app), 'createAnnouncement');
      await fn({ title, bodyRich: body, priority, requiresAck });
      toast({ title: 'Announcement published' });
      setTitle(''); setBody(''); setPriority('normal'); setRequiresAck(false);
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message || 'Could not publish', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Create Announcement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Body (HTML supported)</Label>
          <Textarea rows={8} value={body} onChange={e => setBody(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={v => setPriority(v as any)}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <input id="ack" type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} />
            <Label htmlFor="ack">Require acknowledgement</Label>
          </div>
        </div>
        <Button onClick={submit}>Publish</Button>
      </CardContent>
    </Card>
  );
}