'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db, functions } from '@/lib/firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/hooks/useAuth';

import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { User } from './types';

export function UserManagement() {
  const { user: currentUser, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser || !db) return;

    const fdb = db!;
    let usersQuery = query(collection(fdb, 'users'));
    if (currentUserRole === 'Manager') {
      usersQuery = query(collection(fdb, 'users'), where('managerId', '==', currentUser.uid));
    }

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) } as User));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, currentUserRole]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!db) return;
    const fdb = db!;
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(fdb, 'users', userId));
        toast({ title: 'User Deleted', description: `${userName} has been removed.`, variant: 'destructive' });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
      }
    }
  };

  const handleAddUser = async (values: any) => {
    if (!functions) {
      toast({ title: 'Error', description: 'Functions service is not available.', variant: 'destructive' });
      return;
    }
    const createUser = httpsCallable(functions, 'createUser');
    try {
      await createUser(values);
      toast({ title: 'User Created', description: 'New user has been created successfully.' });
      setIsAddUserOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const canAdmin = currentUserRole === 'Admin';

  return (
    <div className="space-y-6">
      {canAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>User Administration</CardTitle>
            <CardDescription>Add new users or manage existing ones.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Add User
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.manager}</TableCell>
                  <TableCell className="text-right">
                    {canAdmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id, user.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canAdmin && (
        <AddUserDialog isOpen={isAddUserOpen} onOpenChange={setIsAddUserOpen} onSubmit={handleAddUser} />
      )}

      {selectedUser && canAdmin && (
        <EditUserDialog isOpen={isEditUserOpen} onOpenChange={setIsEditUserOpen} user={selectedUser} users={users} />
      )}
    </div>
  );
}