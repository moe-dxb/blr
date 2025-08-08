'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface DocumentSummarizerProps {
  documentTitle: string;
  documentContent: string;
  documentPath: string;
}

export function DocumentSummarizer({ documentTitle, documentContent, documentPath }: DocumentSummarizerProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');
    try {
      const functions = getFunctions();
      const summarizeDocument = httpsCallable(functions, 'summarizeDocument');
      const result = await summarizeDocument({ filePath: documentPath });
      const summaryText = (result.data as { summary: string }).summary;
      setSummary(summaryText);
    } catch (e) {
      setError('Failed to summarize the document. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2 font-headline">Original Document: {documentTitle}</h3>
        <ScrollArea className="h-48 rounded-md border p-4 bg-muted">
            <p className="text-sm text-muted-foreground">{documentContent}</p>
        </ScrollArea>
      </div>
      
      <Button onClick={handleSummarize} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        Generate AI Summary
      </Button>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {isLoading && (
         <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
         </div>
      )}

      {summary && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary"/>
                AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
