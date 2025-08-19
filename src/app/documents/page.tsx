'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { api } from '@/lib/firebase/callables';

export default function PersonalDocumentsPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<{ id: string; fileName: string; contentType: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, 'users', user.uid, 'personalDocuments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFiles(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, [user?.uid]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) return;
    setUploading(true);
    try {
      const { uploadUrl } = await api.generatePersonalDocUploadUrl(file.name, file.type);
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      // Firestore metadata already created by function
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const download = async (docId: string, fileName: string) => {
    if (!user) return;
    const { downloadUrl } = await api.generatePersonalDocDownloadUrl(user.uid, docId, fileName);
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input type="file" onChange={onUpload} disabled={uploading} />
          </div>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2">File</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="px-3 py-2">{f.fileName}</td>
                    <td className="px-3 py-2">{f.contentType}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => download(f.id, f.fileName)}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">No documents yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}