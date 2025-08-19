
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

interface Employee {
  id: string;
  name: string;
  title?: string; 
  department: string;
  avatar?: string;
  email: string;
}

interface EmployeeListProps {
    employees: Employee[];
    loading: boolean;
    error: string | null;
}

const EmployeeCardSkeleton = () => (
    <Card className="text-center flex flex-col">
        <CardHeader className="items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
        </CardHeader>
        <CardContent className="flex-grow">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            <Skeleton className="h-6 w-1/4 mx-auto mt-2" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
)

export function EmployeeList({ employees, loading, error }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => 
    employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.title && employee.title.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [searchTerm, employees]);

  return (
    <div>
        <div className="relative w-full md:w-1/3 mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search employees by name, department, or title..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <p className="text-destructive text-center">{error}</p>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
                Array.from({ length: 8 }).map((_, i) => <EmployeeCardSkeleton key={i} />)
            ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                    <Card key={employee.id} className="text-center flex flex-col">
                        <CardHeader className="items-center">
                        <Avatar className="h-24 w-24 mb-2">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <h3 className="text-lg font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.title || 'N/A'}</p>
                        <Badge variant="secondary" className="mt-2">{employee.department}</Badge>
                        </CardContent>
                        <CardFooter>
                           {/* TODO: Link to a dynamic user profile page */}
                           <Button className="w-full">View Profile</Button>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No employees found.</p>
                </div>
            )}
      </div>
    </div>
  );
}
