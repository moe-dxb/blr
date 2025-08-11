
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const roles = ["Admin", "Manager", "Employee"];

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(roles as [string, ...string[]]),
});

type FormData = z.infer<typeof schema>;

interface AddUserDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (values: FormData) => void;
}

export function AddUserDialog({ isOpen, onOpenChange, onSubmit }: AddUserDialogProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Name" {...register("name")} />
                        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                        <Input placeholder="Email" {...register("email")} />
                        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                        <Input type="password" placeholder="Password" {...register("password")} />
                        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                        <Select {...register("role")}>
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
                        {errors.role && <p className="text-red-500">{errors.role.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add User</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
