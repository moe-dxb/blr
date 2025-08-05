
'use client';

import { useState } from 'react';
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
import { Upload, File, Download, Edit, Trash2 } from "lucide-react";
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

const initialUsers = [
  { id: 1, name: "Aisha Khan", email: "aisha.khan@blr.com", role: "Admin", manager: "John Doe", department: "Technology" },
  { id: 2, name: "Ben Carter", email: "ben.carter@blr.com", role: "Editor", manager: "Aisha Khan", department: "Marketing" },
  { id: 3, name: "Carla Rodriguez", email: "carla.rodriguez@blr.com", role: "Viewer", manager: "John Doe", department: "Human Resources" },
  { id: 4, name: "David Chen", email: "david.chen@blr.com", role: "Editor", manager: "Aisha Khan", department: "Product" },
  { id: 5, name: "John Doe", email: "john.doe@blr.com", role: "Superadmin", manager: "", department: "Executive" },
];

const roles = ["Admin", "Editor", "Viewer"];

export default function AdminPage() {
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<(typeof initialUsers[0]) | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const { toast } = useToast();


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

    const handleSyncUsers = () => {
        if (!csvFile) {
            toast({
                title: "No file selected",
                description: "Please choose a CSV file to upload.",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
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

            const newUsers = rows.slice(1).map((row, index) => {
                const values = row.split(',');
                const name = values[nameIndex]?.trim();
                const email = values[emailIndex]?.trim();
                const role = values[roleIndex]?.trim();

                const existingUser = users.find(u => u.email === email);
                
                return {
                    id: existingUser?.id || users.length + index + 1,
                    name: name,
                    email: email,
                    role: roles.includes(role) ? role : 'Viewer',
                    manager: existingUser?.manager || '',
                    department: existingUser?.department || 'Unassigned',
                };
            }).filter(u => u.name && u.email && u.role); // Filter out any empty rows

            // Add the Superadmin back if they were not in the CSV
            const superadmin = users.find(u => u.role === 'Superadmin');
            const csvHasSuperadmin = newUsers.some(u => u.email === superadmin?.email);
            
            if (superadmin && !csvHasSuperadmin) {
                newUsers.push(superadmin);
            }

            setUsers(newUsers);

            toast({
                title: "Users Synced Successfully",
                description: `Updated ${newUsers.length} users from the CSV file.`,
            });
        };
        reader.readAsText(csvFile);
    };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and organizational structure.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Bulk User Management</CardTitle>
          <CardDescription>
            Add, update, or sync users by uploading a CSV file. The CSV must contain 'name', 'email', and 'role' columns. Any existing users not in the uploaded file will be removed. The default password for new users is BLRWORLD@123.
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
            <Button className="w-full sm:w-auto" onClick={handleSyncUsers}>
                <Upload className="mr-2" />
                Upload and Sync Users
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Management</CardTitle>
          <CardDescription>
            Edit user details, assign roles, and manage reporting lines.
          </CardDescription>
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
                         <Dialog>
                           <DialogTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                               <Edit className="h-4 w-4" />
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
                             </DialogHeader>
                             <div className="grid gap-4 py-4">
                               <div className="grid grid-cols-4 items-center gap-4">
                                 <Label htmlFor="name" className="text-right">Name</Label>
                                 <Input id="name" defaultValue={selectedUser?.name} className="col-span-3" />
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                 <Label htmlFor="email" className="text-right">Email</Label>
                                 <Input id="email" type="email" defaultValue={selectedUser?.email} className="col-span-3" />
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                 <Label htmlFor="role" className="text-right">Role</Label>
                                  <Select defaultValue={selectedUser?.role}>
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
                                 <Input id="department" defaultValue={selectedUser?.department} className="col-span-3" />
                               </div>
                               <div className="grid grid-cols-4 items-center gap-4">
                                 <Label htmlFor="manager" className="text-right">Manager</Label>
                                 <Select defaultValue={selectedUser?.manager}>
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
                                 <Button type="button" variant="secondary">Cancel</Button>
                               </DialogClose>
                               <Button type="submit">Save Changes</Button>
                             </DialogFooter>
                           </DialogContent>
                         </Dialog>
                    )}
                     {user.role !== "Superadmin" && (
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                         </Button>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
