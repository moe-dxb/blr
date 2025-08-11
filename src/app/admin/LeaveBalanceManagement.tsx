
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, doc, setDoc, query, Query } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

interface User {
  id: string;
  name: string;
  email: string;
  leaveBalance?: number;
}

export function LeaveBalanceManagement() {
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    const usersQuery = useMemo(() => query(collection(db, "users")) as Query<User>, []);
    const { data: users, loading, error } = useFirestoreSubscription<User>({ query: usersQuery });

    useEffect(() => {
        if (users) {
            const initialBalances: Record<string, number> = {};
            users.forEach(user => {
                initialBalances[user.id] = user.leaveBalance ?? 12;
            });
            setBalances(initialBalances);
        }
    }, [users]);
    
    if (error) {
        toast({
            title: "Error",
            description: "Failed to fetch users.",
            variant: "destructive"
        });
    }

    const handleBalanceChange = useCallback((userId: string, value: string) => {
        const newBalance = Number(value);
        if (!isNaN(newBalance)) {
            setBalances(prev => ({ ...prev, [userId]: newBalance }));
        }
    }, []);

    const handleSaveChanges = useCallback(async (userId: string) => {
        setIsSaving(prev => ({ ...prev, [userId]: true }));
        try {
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { leaveBalance: balances[userId] }, { merge: true });

            toast({
                title: "Success!",
                description: "Leave balance updated successfully.",
            });
        } catch (err) {
            console.error("Error saving leave balance:", err);
            toast({
                title: "Error",
                description: "Could not update leave balance.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(prev => ({ ...prev, [userId]: false }));
        }
    }, [balances, toast]);

    if (loading) {
        return <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Leave Balance Management</CardTitle>
                <CardDescription>View and manage annual leave balances for all employees.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Available Balance (Days)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        value={balances[user.id] ?? ''} 
                                        onChange={(e) => handleBalanceChange(user.id, e.target.value)}
                                        className="w-24"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleSaveChanges(user.id)}
                                        disabled={isSaving[user.id]}
                                    >
                                        {isSaving[user.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                        Save
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
