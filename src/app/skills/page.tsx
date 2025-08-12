
'use client';

import { useState, useMemo } from 'react';
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
import { Search, Loader2 } from 'lucide-react';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { db } from '@/lib/firebase/firebase';
import { collection, query, Query } from 'firebase/firestore';

interface Employee {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatar?: string;
}

export default function SkillsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const employeesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users')) as Query<Employee>;
  }, []);
  const { data: employees, loading, error } = useFirestoreSubscription<Employee>({ query: employeesQuery });

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(employee =>
        (employee.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employee.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Skills Directory</h1>
            <p className="text-muted-foreground">
            Find colleagues by their skills and expertise.
            </p>
          </CardHeader>
      </Card>

      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or skill (e.g., 'React', 'Project Management')"
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {error && <p className="text-destructive text-center">Error: {error.message}</p>}

      {loading ? (
        <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin"/>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map(employee => (
            <Card key={employee.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>{employee.name?.slice(0, 2) || '??'}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{employee.name}</CardTitle>
                    <CardDescription>{employee.role}</CardDescription>
                </div>
                </CardHeader>
                <CardContent>
                <h4 className="font-semibold mb-2 text-sm">Top Skills:</h4>
                <div className="flex flex-wrap gap-2">
                    {employee.skills?.length ? employee.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                    )) : <p className="text-xs text-muted-foreground">No skills listed.</p>}
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
