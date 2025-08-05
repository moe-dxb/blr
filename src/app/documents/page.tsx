
'use client';

import * as React from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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
import { FileText, Download, Wand2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DocumentSummarizer } from './DocumentSummarizer';

interface Document {
  id: string;
  name: string;
  category: string;
  lastUpdated: string; // Keep as string for simplicity from DB
  content: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDocument, setSelectedDocument] = React.useState<{ title: string; content: string } | null>(null);
  
  React.useEffect(() => {
    setLoading(true);
    const docsCollection = collection(db, "documents");
    const q = query(docsCollection, orderBy("lastUpdated", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const docList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
        setDocuments(docList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching documents:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
            ) : documents.map((doc) => (
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
                  <Dialog onOpenChange={(open) => !open && setSelectedDocument(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => setSelectedDocument({ title: doc.name, content: doc.content })}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Summarize
                      </Button>
                    </DialogTrigger>
                    {selectedDocument && (
                       <DialogContent className="sm:max-w-[625px]">
                         <DialogHeader>
                           <DialogTitle className="font-headline">AI Document Summary</DialogTitle>
                         </DialogHeader>
                         <DocumentSummarizer
                           documentTitle={selectedDocument.title}
                           documentContent={selectedDocument.content}
                         />
                       </DialogContent>
                    )}
                  </Dialog>
                  <Button variant="ghost" size="sm">
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

    