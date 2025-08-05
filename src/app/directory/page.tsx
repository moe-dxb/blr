
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
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
import { Search, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PerformanceReview } from './PerformanceReview';


interface Employee {
  id: string;
  name: string;
  title?: string; // department in user object
  department: string;
  avatar: string;
  hint: string;
  email: string;
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        const userList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            title: data.role,
            department: data.department || 'N/A',
            email: data.email,
            avatar: `https://placehold.co/100x100.png`,
            hint: 'person face',
          };
        });
        setEmployees(userList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching users for directory:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const results = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.title && employee.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Company Directory</h1>
          <p className="text-muted-foreground">Find and connect with your colleagues. Use the AI Assistant for performance reviews.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search employees..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Dialog onOpenChange={(open) => !open && setSelectedEmployee(null)}>
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
                <CardFooter className="flex-col gap-2">
                  <DialogTrigger asChild>
                      <Button className="w-full" variant="outline" onClick={() => setSelectedEmployee(employee)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Start AI Review
                      </Button>
                  </DialogTrigger>
                  <Button className="w-full">View Profile</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
           {selectedEmployee && (
               <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                   <DialogTitle className="font-headline">AI Performance Review Assistant</DialogTitle>
                 </DialogHeader>
                 <PerformanceReview
                    employeeName={selectedEmployee.name}
                    employeeRole={selectedEmployee.title || 'Employee'}
                  />
               </DialogContent>
            )}
        </Dialog>
      )}
    </div>
  );
}
