
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Contract" | "Part-time";
  description: string;
}

export default function JobsPage() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const jobsCollection = collection(db, "jobs");
    const q = query(jobsCollection, orderBy("title"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPosting));
        setJobPostings(jobList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching job postings:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Internal Job Board</h1>
        <p className="text-muted-foreground">Explore new opportunities within the company.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : jobPostings.length > 0 ? (
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
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </CardContent>
              <CardFooter>
                <Button>
                  Apply Now <ArrowRight className="h-4 w-4 ml-2"/>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
           <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    There are currently no open internal positions.
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

    