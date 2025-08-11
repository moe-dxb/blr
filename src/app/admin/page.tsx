
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Users, Car, CalendarDays, Clock, ShieldCheck, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db, functions, storage } from '@/lib/firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingRequests } from './BookingRequests';
import { httpsCallable } from 'firebase/functions';
import { LeaveRequests } from './LeaveRequests';
import { AttendanceReport } from './AttendanceReport';
import { useAuth } from '@/hooks/useAuth';
import { LeaveBalanceManagement } from './LeaveBalanceManagement';

const setUserRole = httpsCallable(functions, 'setUserRole');
const createUser = httpsCallable(functions, 'createUser');

interface WorkHours {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
}
interface UserDocument {
    name: string;
    url: string;
}
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  manager: string;
  department: string;
  workHours?: WorkHours;
  leaveBalance?: number;
  employeeNumber?: string;
  documents?: UserDocument[];
}

const roles = ["Admin", "Manager", "Employee"];
const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

function UserManagement() {
    const { user: currentUser, role: currentUserRole } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<User>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'Employee' });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!currentUser) return;
        
        let usersQuery = query(collection(db, "users"));
        if (currentUserRole === 'Manager') {
            usersQuery = query(collection(db, "users"), where("manager", "==", currentUser.displayName));
        }

        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);
        });

        return () => unsubscribe();
    }, [currentUser, currentUserRole]);


    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        const defaultWorkHours: WorkHours = {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' },
            wednesday: { start: '09:00', end: '18:00' },
            thursday: { start: '09:00', end: '18:00' },
            friday: { start: '09:00', end: '15:00' },
        };
        setEditFormData({ ...user, workHours: user.workHours || defaultWorkHours });
        setIsDialogOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.id]: e.target.value });
    };
    
    const handleWorkHoursChange = (day: keyof WorkHours, field: 'start' | 'end', value: string) => {
        setEditFormData(prev => ({ ...prev, workHours: { ...prev.workHours!, [day]: { ...prev.workHours![day], [field]: value } } }));
    };

    const handleSelectChange = (field: keyof User) => (value: string) => {
        setEditFormData({ ...editFormData, [field]: value });
    };
    
    const handleDocumentUpload = async () => {
        if (!documentFile || !selectedUser) return;
        
        const storageRef = ref(storage, `user-documents/${selectedUser.id}/${documentFile.name}`);
        await uploadBytes(storageRef, documentFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        const newDocument: UserDocument = { name: documentFile.name, url: downloadURL };
        const updatedDocuments = [...(editFormData.documents || []), newDocument];
        setEditFormData(prev => ({ ...prev, documents: updatedDocuments }));
        setDocumentFile(null);
    };

    const handleSaveChanges = async () => {
        if (!selectedUser) return;
        try {
            if (editFormData.role !== selectedUser.role) {
                 await setUserRole({ userId: selectedUser.id, newRole: editFormData.role });
            }

            const userRef = doc(db, "users", selectedUser.id);
            await setDoc(userRef, editFormData, { merge: true });

            toast({ title: "User Updated", description: `${editFormData.name}'s details have been updated successfully.`});
            setIsDialogOpen(false);
            setSelectedUser(null);
        } catch(error: Error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, "users", userId));
                toast({ title: "User Deleted", description: `${userName} has been removed.`, variant: "destructive" });
            } catch (error) {
                 toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
            }
        }
    };
    
    const handleAddUser = async () => {
        try {
            await createUser(newUser);
            toast({ title: "User Created", description: "New user has been created successfully." });
            setIsAddUserOpen(false);
            setNewUser({ email: '', password: '', name: '', role: 'Employee' });
        } catch (error: Error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
      <div className="space-y-6">
       {currentUserRole === 'Admin' && (
        <Card>
            <CardHeader>
            <CardTitle>User Administration</CardTitle>
            <CardDescription>
                Add new users or manage existing ones.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setIsAddUserOpen(true)}><Plus className="mr-2 h-4 w-4" />Add User</Button>
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
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}><Edit className="h-4 w-4" /></Button>
                    {currentUserRole === 'Admin' && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id, user.name)}><Trash2 className="h-4 w-4" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input id="name" value={editFormData?.name || ''} onChange={handleFormChange} />
              <Input id="email" type="email" value={editFormData?.email || ''} disabled />
              <Select value={editFormData?.role} onValueChange={handleSelectChange('role')} disabled={currentUserRole !== 'Admin'}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
              </Select>
              <Input id="department" value={editFormData?.department || ''} onChange={handleFormChange} />
              <Select value={editFormData?.manager} onValueChange={handleSelectChange('manager')}>
                <SelectTrigger><SelectValue placeholder="Select a manager" /></SelectTrigger>
                <SelectContent>{users.filter(u => u.id !== selectedUser?.id && u.role !== 'Employee').map((manager) => <SelectItem key={manager.id} value={manager.name}>{manager.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input id="employeeNumber" placeholder="Employee Number" value={editFormData?.employeeNumber || ''} onChange={handleFormChange} />
              <Card><CardHeader><CardTitle>Work Hours</CardTitle></CardHeader><CardContent className="space-y-2">{daysOfWeek.map((day) => (<div key={day} className="grid grid-cols-3 gap-2"><Label className="capitalize">{day}</Label><Input type="time" value={editFormData.workHours?.[day]?.start || ''} onChange={(e) => handleWorkHoursChange(day, 'start', e.target.value)} /><Input type="time" value={editFormData.workHours?.[day]?.end || ''} onChange={(e) => handleWorkHoursChange(day, 'end', e.target.value)} /></div>))}</CardContent></Card>
              <Card><CardHeader><CardTitle>Documents</CardTitle></CardHeader><CardContent><Input type="file" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} /><Button onClick={handleDocumentUpload}>Upload</Button><div>{editFormData.documents?.map(doc => <div key={doc.url}><a href={doc.url} target="_blank">{doc.name}</a></div>)}</div></CardContent></Card>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <Input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                <Input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                <Input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
    );
}


export default function AdminPage() {
    const { role } = useAuth();
    const isAdmin = role === 'Admin';
    const numTabs = isAdmin ? 5 : 4;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                Manage users and moderate content across the portal.
                </p>
            </div>
            <Tabs defaultValue="user-management" className="w-full">
                <TabsList className={`grid w-full grid-cols-${numTabs}`}>
                    <TabsTrigger value="user-management">
                        <Users className="h-4 w-4 mr-2" />
                        User Management
                    </TabsTrigger>
                     {isAdmin && (
                        <TabsTrigger value="leave-balances">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Leave Balances
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="vehicle-requests">
                        <Car className="h-4 w-4 mr-2" />
                        Vehicle Requests
                    </TabsTrigger>
                    <TabsTrigger value="leave-requests">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Leave Requests
                    </TabsTrigger>
                    <TabsTrigger value="attendance-report">
                        <Clock className="h-4 w-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="user-management">
                    <UserManagement />
                </TabsContent>
                {isAdmin && (
                    <TabsContent value="leave-balances">
                        <LeaveBalanceManagement />
                    </TabsContent>
                )}
                <TabsContent value="vehicle-requests">
                    <BookingRequests />
                </TabsContent>
                 <TabsContent value="leave-requests">
                    <LeaveRequests />
                </TabsContent>
                <TabsContent value="attendance-report">
                    <AttendanceReport />
                </TabsContent>
            </Tabs>
        </div>
    );
}
