
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Upload, File, Download, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot, doc, writeBatch, deleteDoc, setDoc, getDocs } from 'firebase/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  manager: string;
  department: string;
}

const roles = ["Admin", "Editor", "Viewer"];

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<User>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setLoading(true);
        const usersCollection = collection(db, "users");
        const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Failed to fetch users from the database.",
                variant: "destructive"
            });
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [toast]);

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "name,email,role\n"
            + "Example Name,example.email@blr.com,Editor";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setCsvFile(event.target.files[0]);
        }
    };

    const handleSyncUsers = async () => {
        if (!csvFile) {
            toast({
                title: "No file selected",
                description: "Please choose a CSV file to upload.",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) return;
            
            const rows = text.split('\n').filter(row => row.trim() !== '');
            const header = rows[0].split(',').map(h => h.trim());
            const nameIndex = header.indexOf('name');
            const emailIndex = header.indexOf('email');
            const roleIndex = header.indexOf('role');

            if (nameIndex === -1 || emailIndex === -1 || roleIndex === -1) {
                 toast({
                    title: "Invalid CSV Header",
                    description: "The CSV must contain 'name', 'email', and 'role' columns.",
                    variant: "destructive",
                });
                return;
            }

            setLoading(true);
            try {
                const batch = writeBatch(db);
                
                const currentUsersSnapshot = await getDocs(collection(db, "users"));
                const currentUsers = currentUsersSnapshot.docs.map(d => ({id: d.id, ...d.data()} as User));

                const newUsersFromCsv = rows.slice(1).map(row => {
                    const values = row.split(',');
                    return {
                        name: values[nameIndex]?.trim(),
                        email: values[emailIndex]?.trim(),
                        role: values[roleIndex]?.trim(),
                    };
                }).filter(u => u.name && u.email && u.role);

                const emailsInCsv = new Set(newUsersFromCsv.map(u => u.email));
                
                // Delete users not in the CSV (except superadmin)
                for (const user of currentUsers) {
                    if (!emailsInCsv.has(user.email) && user.role !== 'Superadmin') {
                        const userRef = doc(db, "users", user.id);
                        batch.delete(userRef);
                    }
                }

                // Add or update users from the CSV
                for (const csvUser of newUsersFromCsv) {
                     const existingUser = currentUsers.find(u => u.email === csvUser.email);
                     const userId = existingUser?.id || csvUser.email.replace(/[@.]/g, '_'); 
                     const userRef = doc(db, "users", userId);
                     
                     const userData: Partial<User> = {
                         name: csvUser.name,
                         email: csvUser.email,
                         role: roles.includes(csvUser.role) ? csvUser.role : 'Viewer'
                     };

                     if (existingUser) {
                        userData.manager = existingUser.manager || '';
                        userData.department = existingUser.department || 'Unassigned';
                     } else {
                        userData.manager = '';
                        userData.department = 'Unassigned';
                     }

                     batch.set(userRef, userData, { merge: true });
                }

                await batch.commit();

                toast({
                    title: "Users Synced Successfully",
                    description: "User list has been updated in the database.",
                });
            } catch (error) {
                console.error("Error syncing users:", error);
                 toast({
                    title: "Sync Error",
                    description: "An error occurred while syncing users.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
                setCsvFile(null);
            }
        };
        reader.readAsText(csvFile);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditFormData(user);
        setIsDialogOpen(true);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (field: keyof User) => (value: string) => {
        setEditFormData({ ...editFormData, [field]: value });
    };

    const handleSaveChanges = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            const userRef = doc(db, "users", selectedUser.id);
            await setDoc(userRef, editFormData, { merge: true });
            toast({
                title: "User Updated",
                description: `${editFormData.name}'s details have been updated successfully.`
            });
            setIsDialogOpen(false);
            setSelectedUser(null);
        } catch(error) {
            console.error("Error saving user:", error);
            toast({
                title: "Error",
                description: "Failed to save user changes.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, "users", userId));
                toast({
                    title: "User Deleted",
                    description: `${userName} has been removed from the database.`,
                    variant: "destructive"
                });
            } catch (error) {
                 console.error("Error deleting user:", error);
                 toast({
                    title: "Error",
                    description: "Failed to delete user.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        }
    };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and organizational structure directly in the database.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Bulk User Management</CardTitle>
          <CardDescription>
            Add, update, or sync users by uploading a CSV file. The CSV must contain 'name', 'email', and 'role' columns. Any existing users not in the uploaded file (except the Superadmin) will be removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2" />
                Download Template
            </Button>
            <label htmlFor="csv-upload" className="flex-1 w-full sm:w-auto">
                <Button asChild className="w-full cursor-pointer">
                <span>
                    <File className="mr-2" />
                    {csvFile ? csvFile.name : "Choose CSV File"}
                </span>
                </Button>
                <Input id="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileUpload} />
            </label>
            <Button className="w-full sm:w-auto" onClick={handleSyncUsers} disabled={loading}>
                {loading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                Upload and Sync Users
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Management</CardTitle>
          <CardDescription>
            Edit user details, assign roles, and manage reporting lines. Changes are saved live to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !users.length ? (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
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
                    <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={user.role === 'Superadmin' ? "destructive" : "secondary"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.manager}</TableCell>
                    <TableCell className="text-right">
                        {user.role !== "Superadmin" && (
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {user.role !== "Superadmin" && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteUser(user.id, user.name)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editFormData?.name || ''} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={editFormData?.email || ''} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                  <Select value={editFormData?.role} onValueChange={handleSelectChange('role')}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <Input id="department" value={editFormData?.department || ''} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manager" className="text-right">Manager</Label>
                <Select value={editFormData?.manager} onValueChange={handleSelectChange('manager')}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.id !== selectedUser?.id).map((manager) => (
                      <SelectItem key={manager.id} value={manager.name}>{manager.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges} disabled={loading}>
                {loading ? <Loader2 className="mr-2 animate-spin"/> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    
