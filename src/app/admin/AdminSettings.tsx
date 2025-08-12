'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    theme: { primary: '#0ea5e9', secondary: '#10b981', font: 'Inter', logoUrl: '' },
    policies: { leave: { annualDefault: 20, sickDefault: 10, carryover: false }, workHoursDefaults: { start: '09:00', end: '17:00', days: [1,2,3,4,5] } },
    attendance: { toleranceMinutes: 15 },
    features: { announcements: true, policies: true, wellbeing: true, community: true, directory: true, jobs: false, resources: false, expenses: false }
  });

  useEffect(() => {
    if (!db) return;
    (async () => {
      const ref = doc(db, 'settings', 'global');
      const snap = await getDoc(ref);
      if (snap.exists()) setData({ ...data, ...snap.data() });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!db) return;
    await setDoc(doc(db, 'settings', 'global'), data, { merge: true });
    toast({ title: 'Settings saved' });
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Admin Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary color</Label>
            <Input value={data.theme.primary} onChange={e => setData({ ...data, theme: { ...data.theme, primary: e.target.value } })} />
          </div>
          <div>
            <Label>Secondary color</Label>
            <Input value={data.theme.secondary} onChange={e => setData({ ...data, theme: { ...data.theme, secondary: e.target.value } })} />
          </div>
          <div>
            <Label>Font family</Label>
            <Input value={data.theme.font} onChange={e => setData({ ...data, theme: { ...data.theme, font: e.target.value } })} />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input value={data.theme.logoUrl} onChange={e => setData({ ...data, theme: { ...data.theme, logoUrl: e.target.value } })} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Features</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.keys(data.features).map((k) => (
              <div key={k} className="flex items-center justify-between">
                <Label className="capitalize">{k}</Label>
                <Switch checked={!!data.features[k]} onCheckedChange={(v) => setData({ ...data, features: { ...data.features, [k]: v } })} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Default start</Label>
            <Input value={data.policies.workHoursDefaults.start} onChange={e => setData({ ...data, policies: { ...data.policies, workHoursDefaults: { ...data.policies.workHoursDefaults, start: e.target.value } } })} />
          </div>
          <div>
            <Label>Default end</Label>
            <Input value={data.policies.workHoursDefaults.end} onChange={e => setData({ ...data, policies: { ...data.policies, workHoursDefaults: { ...data.policies.workHoursDefaults, end: e.target.value } } })} />
          </div>
          <div>
            <Label>Tolerance (minutes)</Label>
            <Input type="number" value={data.attendance.toleranceMinutes} onChange={e => setData({ ...data, attendance: { toleranceMinutes: parseInt(e.target.value || '15', 10) } })} />
          </div>
        </div>
        <Button onClick={save}>Save</Button>
      </CardContent>
    </Card>
  );
}