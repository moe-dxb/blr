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
import { ArrowRight, Clock } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Advanced Leadership Skills",
    category: "Management",
    duration: "4 Weeks",
    image: "https://placehold.co/600x400.png",
    hint: "leadership training",
    description: "Develop the skills needed to lead high-performing teams and drive organizational success.",
  },
  {
    id: 2,
    title: "Mastering Project Management",
    category: "Productivity",
    duration: "6 Hours",
    image: "https://placehold.co/600x400.png",
    hint: "project management",
    description: "Learn the fundamentals of project management, from planning and execution to successful delivery.",
  },
  {
    id: 3,
    title: "Cybersecurity Fundamentals",
    category: "IT & Security",
    duration: "2 Hours",
    image: "https://placehold.co/600x400.png",
    hint: "cybersecurity code",
    description: "Understand the basics of cybersecurity and how to protect company and personal data.",
  },
  {
    id: 4,
    title: "Effective Communication",
    category: "Soft Skills",
    duration: "3 Weeks",
    image: "https://placehold.co/600x400.png",
    hint: "communication skills",
    description: "Enhance your communication skills to build better relationships and collaborate more effectively.",
  },
  {
    id: 5,
    title: "Data Analysis with Python",
    category: "Data Science",
    duration: "8 Weeks",
    image: "https://placehold.co/600x400.png",
    hint: "data analysis",
    description: "A comprehensive introduction to data analysis techniques using the Python programming language.",
  },
  {
    id: 6,
    title: "Public Speaking Workshop",
    category: "Soft Skills",
    duration: "2 Days",
    image: "https://placehold.co/600x400.png",
    hint: "public speaking",
    description: "Build confidence and learn techniques for delivering impactful presentations.",
  },
];

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Learning & Development</h1>
        <p className="text-muted-foreground">
          Invest in your growth. Browse our catalog of courses and training materials.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <Image
                src={course.image}
                alt={course.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint={course.hint}
              />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <Badge variant="secondary" className="mb-2">{course.category}</Badge>
              <CardTitle className="font-headline text-lg mb-2">{course.title}</CardTitle>
              <CardDescription className="text-sm">{course.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}
                </div>
              <Button variant="ghost" size="sm">
                Start Learning <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
