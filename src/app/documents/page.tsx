
'use client';

import * as React from 'react';
import { db, storage } from '@/lib/firebase/firebase';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { ref, getDownloadURL } from "firebase/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2 } from "lucide-react";
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  category: string;
  lastUpdated: string; // Keep as string from DB for simplicity
  path: string; // The path for downloading from storage
}

export default function DocumentsPage() {
  const { toast } = useToast();
  
  const documentsQuery = React.useMemo(() => {
    return query(collection(db, "documents"), orderBy("lastUpdated", "desc")) as Query<Document>;
  }, []);

  const { data: documents, loading, error } = useFirestoreSubscription<Document>({ query: documentsQuery });

  if(error) {
      toast({
          title: "Error",
          description: "Could not load documents. Please try again later.",
          variant: "destructive"
      })
  }

  const handleDownload = async (path: string, docName: string) => {
    try {
      const fileRef = ref(storage, path);
      const url = await getDownloadURL(fileRef);
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank" // Open in new tab to start download
      link.download = docName; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error downloading file:", err);
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Document Repository</h1>
        <p className="text-muted-foreground">Find all company policies, guidelines, and forms here.</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : documents?.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground"/>
                  {doc.name}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    doc.category === "HR Policy" ? "default" : 
                    doc.category === "Finance" ? "secondary" : "outline"
                  }>{doc.category}</Badge>
                </TableCell>
                <TableCell>{new Date(doc.lastUpdated).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.path, doc.name)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
