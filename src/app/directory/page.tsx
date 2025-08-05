
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
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
import { Search, Loader2 } from "lucide-react";

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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => {
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
        setFilteredEmployees(userList);
      } catch (error) {
        console.error("Error fetching users for directory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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
          <p className="text-muted-foreground">Find and connect with your colleagues.</p>
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
              <CardFooter className="flex justify-center gap-2">
                <Button className="flex-1">View Profile</Button>
                <Button variant="outline" className="flex-1">Message</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
