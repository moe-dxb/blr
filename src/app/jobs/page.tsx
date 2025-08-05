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
import { MapPin, Briefcase, ArrowRight } from "lucide-react";

const jobPostings = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    department: "Technology",
    location: "Remote",
    type: "Full-time",
    description: "We are looking for an experienced Frontend Engineer to join our growing team. You will be responsible for building and maintaining our web applications.",
  },
  {
    id: 2,
    title: "Digital Marketing Specialist",
    department: "Marketing",
    location: "BLR Main Office",
    type: "Full-time",
    description: "The marketing team is seeking a creative Digital Marketing Specialist to manage our online presence and campaigns.",
  },
  {
    id: 3,
    title: "HR Generalist",
    department: "Human Resources",
    location: "BLR Main Office",
    type: "Contract",
    description: "A 6-month contract position for an HR Generalist to support our employee relations and recruitment efforts.",
  },
  {
    id: 4,
    title: "Junior Product Designer",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    description: "An exciting opportunity for a junior designer to contribute to the user experience of our core products.",
  },
];

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Internal Job Board</h1>
        <p className="text-muted-foreground">Explore new opportunities within the company.</p>
      </div>

      <div className="space-y-4">
        {jobPostings.map((job) => (
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
        ))}
      </div>
    </div>
  );
}
