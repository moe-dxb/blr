// src/app/expenses/ReceiptUploader.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ReceiptUploaderProps {
  claimId: string; // The ID of the expense claim to associate the receipt with
  onUploadComplete: (filePath: string) => void;
}

export function ReceiptUploader({ claimId, onUploadComplete }: ReceiptUploaderProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // 1. Get the signed URL from our backend function
      const functions = getFunctions();
      const getUrl = httpsCallable(functions, 'getReceiptUploadUrl');
      const res = await getUrl({
        fileName: file.name,
        contentType: file.type,
        claimId: claimId,
      }) as { data: { url: string; filePath: string } };
      
      const { url, filePath } = res.data;

      // 2. Upload the file directly to Google Cloud Storage using the signed URL
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast({ title: 'Upload Successful', description: 'Receipt has been uploaded.' });
          onUploadComplete(filePath);
          setFile(null);
        } else {
          throw new Error('Upload failed with status: ' + xhr.status);
        }
      };
      
      xhr.onerror = () => {
         throw new Error('An error occurred during the upload.');
      };

      xhr.send(file);

    } catch (error: any) {
      toast({ title: 'Upload Error', description: error.message, variant: 'destructive' });
      setUploading(false);
    }
  };

  if (file) {
    return (
      <div className="border p-4 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileIcon className="h-6 w-6" />
            <span>{file.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>
        </div>
        {uploading && <Progress value={progress} />}
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? `Uploading... ${progress.toFixed(0)}%` : 'Confirm and Upload'}
        </Button>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary">
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
      {isDragActive ? (
        <p>Drop the receipt here ...</p>
      ) : (
        <p>Drag 'n' drop a receipt image here, or click to select a file</p>
      )}
    </div>
  );
}
