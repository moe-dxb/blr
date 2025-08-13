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
  
  const employeesQuery = useMemo(() =&gt; {
    if (!db) return null;
    return query(collection(db, 'users')) as Query&lt;Employee&gt;;
  }, []);
  const { data: employees, loading, error } = useFirestoreSubscription&lt;Employee&gt;({ query: employeesQuery });

  const filteredEmployees = useMemo(() =&gt; {
    if (!employees) return [];
    return employees.filter(employee =&gt;
        (employee.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employee.skills || []).some(skill =&gt; skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  return (
    &lt;div className="space-y-6"&gt;
      &lt;Card&gt;
          &lt;CardHeader&gt;
            &lt;h1 className="text-3xl font-bold font-headline"&gt;Skills Directory&lt;/h1&gt;
            &lt;p className="text-muted-foreground"&gt;
            Find colleagues by their skills and expertise.
            &lt;/p&gt;
          &lt;/CardHeader&gt;
      &lt;/Card&gt;

      &lt;div className="relative w-full max-w-lg"&gt;
        &lt;Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /&gt;
        &lt;Input
          placeholder="Search by name or skill (e.g., 'React', 'Project Management')"
          className="pl-9"
          value={searchTerm}
          onChange={(e) =&gt; setSearchTerm(e.target.value)}
        /&gt;
      &lt;/div&gt;
      
      {error &amp;&amp; &lt;p className="text-destructive text-center"&gt;Error: {error}&lt;/p&gt;}

      {loading ? (
        &lt;div className="flex justify-center py-8"&gt;
            &lt;Loader2 className="h-8 w-8 animate-spin"/&gt;
        &lt;/div&gt;
      ) : (
        &lt;div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"&gt;
            {filteredEmployees.map(employee =&gt; (
            &lt;Card key={employee.id}&gt;
                &lt;CardHeader className="flex flex-row items-center gap-4"&gt;
                &lt;Avatar className="h-16 w-16"&gt;
                    &lt;AvatarImage src={employee.avatar} /&gt;
                    &lt;AvatarFallback&gt;{employee.name?.slice(0, 2) || '??'}&lt;/AvatarFallback&gt;
                &lt;/Avatar&gt;
                &lt;div&gt;
                    &lt;CardTitle&gt;{employee.name}&lt;/CardTitle&gt;
                    &lt;CardDescription&gt;{employee.role}&lt;/CardDescription&gt;
                &lt;/div&gt;
                &lt;/CardHeader&gt;
                &lt;CardContent&gt;
                &lt;h4 className="font-semibold mb-2 text-sm"&gt;Top Skills:&lt;/h4&gt;
                &lt;div className="flex flex-wrap gap-2"&gt;
                    {employee.skills?.length ? employee.skills.map(skill =&gt; (
                    &lt;Badge key={skill} variant="secondary"&gt;{skill}&lt;/Badge&gt;
                    )) : &lt;p className="text-xs text-muted-foreground"&gt;No skills listed.&lt;/p&gt;}
                &lt;/div&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
            ))}
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
}