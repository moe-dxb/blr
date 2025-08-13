'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface AttachmentMeta { fileName: string; path: string }

type Audience =
  | { type: 'all' }
  | { type: 'role'; role: 'Admin' | 'Manager' | 'Employee' }
  | { type: 'department'; department: string };

export default function PolicyEditor() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [audType, setAudType] = useState<'all' | 'role' | 'department'>('all');
  const [audRole, setAudRole] = useState<'Admin' | 'Manager' | 'Employee'>('Employee');
  const [audDept, setAudDept] = useState('');
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({ extensions: [StarterKit], content: '<p>Write policy content...</p>' });

  const audience: Audience = useMemo(() => {
    if (audType === 'all') return { type: 'all' };
    if (audType === 'role') return { type: 'role', role: audRole };
    return { type: 'department', department: audDept };
  }, [audType, audRole, audDept]);

  const publish = useCallback(async () => {
    if (!title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (!app) { toast({ title: 'App not ready', variant: 'destructive' }); return; }
    const html = editor?.getHTML() || '';
    try {
      const fn = httpsCallable(getFunctions(app), 'publishPolicy');
      const res: any = await fn({ title, contentRich: html, category, attachments, audience });
      toast({ title: 'Policy published', description: `ID: ${res.data.id}` });
      setTitle(''); editor?.commands.setContent('<p></p>'); setAttachments([]);
    } catch (e: any) {
      toast({ title: 'Failed to publish', description: e.message || 'Error', variant: 'destructive' });
    }
  }, [title, category, attachments, audience, editor]);

  const attach = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !app) return;
    const sel = files[0];
    try {
      const up = httpsCallable(getFunctions(app), 'generatePolicyAttachmentUploadUrl');
      const meta: any = await up({ fileName: sel.name, contentType: sel.type });
      const { uploadUrl, path } = meta.data as { uploadUrl: string; path: string };
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': sel.type }, body: sel });
      setAttachments(prev => [...prev, { fileName: sel.name, path }]);
      toast({ title: 'File uploaded', description: sel.name });
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message || 'Error', variant: 'destructive' });
    }
  }, [fileRef]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Policy Editor</CardTitle>
        <CardDescription>Create or update policies with versioning and targeting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Content</Label>
          <div className="border rounded-md p-2 min-h-40">
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={v => setCategory(v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Audience</Label>
            <Select value={audType} onValueChange={v => setAudType(v as any)}>
              <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {audType === 'role' && (
            <div>
              <Label>Role</Label>
              <Select value={audRole} onValueChange={v => setAudRole(v as any)}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {audType === 'department' && (
            <div>
              <Label>Department</Label>
              <Input placeholder="e.g., HR" value={audDept} onChange={e => setAudDept(e.target.value)} />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Attachments</Label>
          <Input ref={fileRef} type="file" onChange={attach} />
          <ul className="text-sm text-muted-foreground list-disc pl-5">
            {attachments.map((a, i) => (<li key={i}>{a.fileName}</li>))}
          </ul>
        </div>
        <div className="flex justify-end">
          <Button onClick={publish}>Publish</Button>
        </div>
      </CardContent>
    </Card>
  );
}