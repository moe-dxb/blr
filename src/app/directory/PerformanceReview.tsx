
'use client';

import { useState } from 'react';
import { generatePerformanceReview } from '@/ai/flows/performance-review';
import type { PerformanceReviewInput, PerformanceReviewOutput } from '@/ai/flows/performance-review';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, User, Briefcase, Star, TrendingUp, Bullseye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PerformanceReviewProps {
  employeeName: string;
  employeeRole: string;
}

export function PerformanceReview({ employeeName, employeeRole }: PerformanceReviewProps) {
  const [review, setReview] = useState<PerformanceReviewOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReview = async () => {
    setIsLoading(true);
    setError('');
    setReview(null);
    try {
      const input: PerformanceReviewInput = { name: employeeName, role: employeeRole };
      const result = await generatePerformanceReview(input);
      setReview(result);
    } catch (e) {
      setError('Failed to generate the performance review. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-muted/50">
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle className="font-headline">{employeeName}</CardTitle>
                    <CardDescription>{employeeRole}</CardDescription>
                </div>
                <Button onClick={handleGenerateReview} disabled={isLoading} size="sm">
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate with AI
                </Button>
            </div>
        </CardHeader>
      </Card>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {isLoading && (
         <div className="space-y-3">
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            </div>
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
             <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            </div>
         </div>
      )}

      {review && (
        <div className="space-y-4 text-sm">
            <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Star className="h-5 w-5 text-primary"/> Key Strengths</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {review.strengths.map((strength, i) => <li key={i}>{strength}</li>)}
                </ul>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><TrendingUp className="h-5 w-5 text-primary"/> Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {review.areasForImprovement.map((area, i) => <li key={i}>{area}</li>)}
                </ul>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Bullseye className="h-5 w-5 text-primary"/> Actionable Goals for Next Quarter</h3>
                 <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {review.suggestedGoals.map((goal, i) => <li key={i}>{goal}</li>)}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
}
