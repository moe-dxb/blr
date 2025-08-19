
'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Users, PlusCircle } from "lucide-react";
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { collection, query, Query } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2 } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  members: number;
  image: string;
  hint: string;
}

export default function CommunityPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const groupsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "communityGroups")) as Query<Group>;
  }, []);
  const { data: groups, loading, error } = useFirestoreSubscription<Group>({ query: groupsQuery });

  // TODO: Add join and create group functionality
  const handleJoinGroup = (groupId: string) => console.log("Joining group:", groupId);
  const handleCreateGroup = () => setIsCreateOpen(true);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Community & Groups</h1>
          <p className="text-muted-foreground">
            Connect with colleagues who share your interests.
          </p>
        </div>
        <Button onClick={handleCreateGroup}>
            <PlusCircle className="mr-2" />
            Create New Group
        </Button>
      </div>

      {loading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
      {error && <p className="text-destructive">Error loading groups.</p>}
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups?.map(group => (
          <Card key={group.id} className="overflow-hidden">
            <CardHeader className="p-0">
                <Image src={group.image || 'https://placehold.co/600x400.png'} alt={group.name} width={600} height={400} className="w-full h-40 object-cover" />
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="font-headline text-lg">{group.name}</CardTitle>
                <div className="flex items-center text-muted-foreground text-sm mt-2">
                    <Users className="h-4 w-4 mr-2" />
                    {group.members} members
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleJoinGroup(group.id)}>Join Group</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* TODO: Add a Dialog for creating a new group */}
    </div>
  );
}
