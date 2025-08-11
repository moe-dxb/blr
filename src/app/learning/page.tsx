
'use client';

import { useMemo } from 'react';
import Image from "next/image";
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
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  image: string;
  description: string;
}

export default function LearningPage() {
    const { toast } = useToast();

    const coursesQuery = useMemo(() => {
        return query(collection(db, "learningCourses"), orderBy("title"));
    }, []);

    const { data: courses, loading, error } = useFirestoreSubscription<Course>({ query: coursesQuery });

    if(error){
        toast({ title: "Error", description: "Could not load courses.", variant: "destructive" });
    }

    const handleStartLearning = (courseId: string) => {
        // Placeholder for enrollment logic
        toast({
            title: "Enrollment Successful",
            description: `You have been enrolled in course #${courseId}.`
        });
    };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Learning & Development</h1>
            <p className="text-muted-foreground">
            Invest in your growth. Browse our catalog of courses and training materials.
            </p>
        </CardHeader>
      </Card>
      
      {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                <Image
                    src={course.image || "https://placehold.co/600x400.png"}
                    alt={course.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                />
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                <CardTitle className="font-headline text-lg mb-2">{course.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-3">{course.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                    </div>
                <Button variant="ghost" size="sm" onClick={() => handleStartLearning(course.id)}>
                    Start Learning <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
