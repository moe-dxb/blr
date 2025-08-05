
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from 'lucide-react';

const employees = [
  { id: 1, name: 'Aisha Khan', role: 'Lead Developer', skills: ['React', 'Node.js', 'GraphQL', 'AWS'], avatar: 'https://placehold.co/100x100.png', hint: 'woman face' },
  { id: 2, name: 'John Doe', role: 'Project Manager', skills: ['Agile', 'Scrum', 'JIRA', 'Product Roadmapping'], avatar: 'https://placehold.co/100x100.png', hint: 'man face'  },
  { id: 3, name: 'Maria Garcia', role: 'UX/UI Designer', skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], avatar: 'https://placehold.co/100x100.png', hint: 'woman face' },
  { id: 4, name: 'Chen Wei', role: 'Data Scientist', skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'], avatar: 'https://placehold.co/100x100.png', hint: 'man face' },
];

export default function SkillsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Skills Directory</h1>
        <p className="text-muted-foreground">
          Find colleagues by their skills and expertise.
        </p>
      </div>

      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or skill..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map(employee => (
          <Card key={employee.id}>
            <CardHeader className="flex flex-row items-center gap-4">
               <Avatar className="h-16 w-16">
                 <AvatarImage src={employee.avatar} data-ai-hint={employee.hint} />
                 <AvatarFallback>{employee.name.slice(0, 2)}</AvatarFallback>
               </Avatar>
               <div>
                <CardTitle>{employee.name}</CardTitle>
                <CardDescription>{employee.role}</CardDescription>
               </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Top Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
