
'use client';

import { useMemo } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { useToast } from '@/hooks/use-toast';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Contract" | "Part-time";
  description: string;
}

export default function JobsPage() {
  const { toast } = useToast();
  
  const jobsQuery = useMemo(() => {
    return query(collection(db, "jobs"), orderBy("title")) as Query<JobPosting>;
  }, []);

  const { data: jobPostings, loading, error } = useFirestoreSubscription<JobPosting>({ query: jobsQuery });

  if(error) {
    toast({
      title: "Error",
      description: "Could not load job postings.",
      variant: "destructive"
    })
  }

  const handleApply = (jobId: string) => {
      // Placeholder for application logic
      toast({
          title: "Application Submitted",
          description: `Your application for job #${jobId} has been submitted.`
      });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Internal Job Board</h1>
            <p className="text-muted-foreground">Explore new opportunities within the company.</p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : jobPostings && jobPostings.length > 0 ? (
          jobPostings.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 pt-2">
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>{job.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleApply(job.id)}>
                  Apply Now <ArrowRight className="h-4 w-4 ml-2"/>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
           <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    There are currently no open internal positions. Check back later!
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
