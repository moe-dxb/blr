
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  title?: string; 
  department: string;
  avatar: string;
  hint: string;
  email: string;
}

interface EmployeeListProps {
    employees: Employee[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
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
            placeholder="Search employees..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((employee) => (
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
            <CardFooter>
              <Button className="w-full">View Profile</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
