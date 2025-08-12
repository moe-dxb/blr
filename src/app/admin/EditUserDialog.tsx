
'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db, functions, storage } from "@/lib/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from 'firebase/functions';
import { User } from './types';
import { useState } from "react";

const roles = ["Admin", "Manager", "Employee"];
const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.enum(roles as [string, ...string[]]),
    department: z.string().min(1, "Department is required"),
    manager: z.string().optional(),
    employeeNumber: z.string().optional(),
    workHours: z.object({
        monday: z.object({ start: z.string(), end: z.string() }),
        tuesday: z.object({ start: z.string(), end: z.string() }),
        wednesday: z.object({ start: z.string(), end: z.string() }),
        thursday: z.object({ start: z.string(), end: z.string() }),
        friday: z.object({ start: z.string(), end: z.string() }),
    }),
    documents: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
});

type FormData = z.infer<typeof schema>;

interface EditUserDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: User;
    users: User[];
}

export function EditUserDialog({ isOpen, onOpenChange, user, users }: EditUserDialogProps) {
    const { role: currentUserRole } = useAuth();
    const { toast } = useToast();
    const [documentFile, setDocumentFile] = useState<File | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            ...user,
            workHours: user.workHours || {
                monday: { start: '09:00', end: '18:00' },
                tuesday: { start: '09:00', end: '18:00' },
                wednesday: { start: '09:00', end: '18:00' },
                thursday: { start: '09:00', end: '18:00' },
                friday: { start: '09:00', end: '15:00' },
            },
            documents: user.documents || [],
        },
    });

    const documents = watch("documents");

    const handleDocumentUpload = async () => {
        if (!documentFile || !storage) return;

        const storageRef = ref(storage, `user-documents/${user.id}/${documentFile.name}`);
        await uploadBytes(storageRef, documentFile);
        const downloadURL = await getDownloadURL(storageRef);

        const newDocument = { name: documentFile.name, url: downloadURL };
        setValue("documents", [...(documents || []), newDocument]);
        setDocumentFile(null);
    };

    const onSubmit = async (data: FormData) => {
        try {
            if (data.role !== user.role) {
                if (!functions) {
                    throw new Error("Functions service is not available.");
                }
                const setUserRole = httpsCallable(functions, 'setUserRole');
                await setUserRole({ userId: user.id, newRole: data.role });
            }

            if (!db) {
                throw new Error("Database service is not available.");
            }
            const userRef = doc(db, "users", user.id);
            await setDoc(userRef, data, { merge: true });

            toast({ title: "User Updated", description: `${data.name}'s details have been updated successfully.` });
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[825px]">
                <DialogHeader>
                    <DialogTitle>Edit User: {user.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <Input {...register("name")} />
                        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                        <Input value={user.email} disabled />
                        <Select onValueChange={(value) => setValue('role', value)} defaultValue={user.role} disabled={currentUserRole !== 'Admin'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input {...register("department")} />
                        {errors.department && <p className="text-red-500">{errors.department.message}</p>}
                        <Select onValueChange={(value) => setValue('manager', value)} defaultValue={user.manager}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                            <SelectContent>
                                {users
                                    .filter((u) => u.id !== user.id && u.role !== 'Employee')
                                    .map((manager) => (
                                        <SelectItem key={manager.id} value={manager.name}>
                                            {manager.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <Input placeholder="Employee Number" {...register("employeeNumber")} />
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="grid grid-cols-3 gap-2">
                                        <Label className="capitalize">{day}</Label>
                                        <Input type="time" {...register(`workHours.${day}.start`)} />
                                        <Input type="time" {...register(`workHours.${day}.end`)} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input type="file" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                                <Button onClick={handleDocumentUpload}>Upload</Button>
                                <div>
                                    {documents?.map((doc) => (
                                        <div key={doc.url}>
                                            <a href={doc.url} target="_blank" rel="noreferrer">
                                                {doc.name}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>.
            </DialogContent>
        </Dialog>
    );
}
