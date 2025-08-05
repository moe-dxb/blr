import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const employees = [
  {
    id: 1,
    name: "Aisha Khan",
    title: "Lead Engineer",
    department: "Technology",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman face",
    email: "aisha.khan@blr.com",
  },
  {
    id: 2,
    name: "Ben Carter",
    title: "Marketing Director",
    department: "Marketing",
    avatar: "https://placehold.co/100x100.png",
    hint: "man face",
    email: "ben.carter@blr.com",
  },
  {
    id: 3,
    name: "Carla Rodriguez",
    title: "HR Manager",
    department: "Human Resources",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman portrait",
    email: "carla.rodriguez@blr.com",
  },
  {
    id: 4,
    name: "David Chen",
    title: "Product Manager",
    department: "Product",
    avatar: "https://placehold.co/100x100.png",
    hint: "man portrait",
    email: "david.chen@blr.com",
  },
  {
    id: 5,
    name: "Emily White",
    title: "UX/UI Designer",
    department: "Design",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman professional",
    email: "emily.white@blr.com",
  },
  {
    id: 6,
    name: "Frank Miller",
    title: "Sales Executive",
    department: "Sales",
    avatar: "https://placehold.co/100x100.png",
    hint: "man professional",
    email: "frank.miller@blr.com",
  },
  {
    id: 7,
    name: "Grace Lee",
    title: "Financial Analyst",
    department: "Finance",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman office",
    email: "grace.lee@blr.com",
  },
  {
    id: 8,
    name: "Henry Wilson",
    title: "Operations Lead",
    department: "Operations",
    avatar: "https://placehold.co/100x100.png",
    hint: "man glasses",
    email: "henry.wilson@blr.com",
  },
];

export default function DirectoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Company Directory</h1>
          <p className="text-muted-foreground">Find and connect with your colleagues.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="text-center flex flex-col">
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src={employee.avatar} data-ai-hint={employee.hint} />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="flex-grow">
              <h3 className="text-lg font-semibold">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.title}</p>
              <Badge variant="secondary" className="mt-2">{employee.department}</Badge>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
              <Button className="flex-1">View Profile</Button>
              <Button variant="outline" className="flex-1">Message</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
