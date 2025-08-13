'use client';

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestoreSubscription } from "@/hooks/useFirestoreSubscription";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/lib/firebase/firebase";
import { collection, addDoc, query, where, serverTimestamp, Query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

const expenseSchema = z.object({
  date: z.string().nonempty("Date is required"),
  category: z.string().nonempty("Category is required"),
  amount: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Amount must be positive")),
  description: z.string().nonempty("Description is required"),
  receipt: z.any().refine((val) => typeof window !== 'undefined' && val instanceof FileList && val.length === 1, "Receipt is required."),
});

 type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseClaim {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    category: string;
}

export default function ExpenseClaimPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema)
    });

    const claimsQuery = useMemo(() => {
        if(!user || !db) return null;
        return query(collection(db, "expenseClaims"), where("userId", "==", user.uid)) as Query<ExpenseClaim>;
    }, [user]);

    const { data: claims, loading, error } = useFirestoreSubscription<ExpenseClaim>({ query: claimsQuery, enabled: !!user });
    
    if(error) {
        toast({ title: "Error", description: "Could not load expense claims.", variant: "destructive" });
    }

    const onSubmit = async (data: ExpenseFormData) => {
        if(!user || !db || !storage) return;
        
        try {
            const receiptFile = (data.receipt as FileList)[0];
            const receiptRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${receiptFile.name}`);
            await uploadBytes(receiptRef, receiptFile);
            const receiptUrl = await getDownloadURL(receiptRef);
            
            await addDoc(collection(db, "expenseClaims"), {
                ...data,
                receipt: receiptUrl,
                userId: user.uid,
                userName: user.displayName,
                status: 'Pending',
                submittedAt: serverTimestamp()
            });
            
            toast({ title: "Success", description: "Expense claim submitted successfully." });
            reset();

        } catch (err) {
            console.error("Submission Error: ", err);
            toast({ title: "Error", description: "Failed to submit claim.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Expense Claims</CardTitle>
                <CardDescription>
                    Submit and track your expense claims.
                </CardDescription>
            </CardHeader>
        </Card>

       <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">New Expense Claim</CardTitle>
                            <CardDescription>Fill in the details for your new claim.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date of Expense</Label>
                                <Input id="date" type="date" {...register("date")} />
                                {errors.date && <p className="text-destructive text-sm">{errors.date.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(value) => setValue('category', value)} defaultValue={field.value}>
                                            <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="meals">Meals & Entertainment</SelectItem>
                                                <SelectItem value="travel">Travel</SelectItem>
                                                <SelectItem value="supplies">Office Supplies</SelectItem>
                                                <SelectItem value="software">Software</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && <p className="text-destructive text-sm">{errors.category.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (USD)</Label>
                                <Input id="amount" type="number" placeholder="e.g., 50.00" {...register("amount")} />
                                {errors.amount && <p className="text-destructive text-sm">{errors.amount.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" placeholder="e.g., Lunch with ACME Inc." {...register("description")} />
                                {errors.description && <p className="text-destructive text-sm">{errors.description.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receipt">Upload Receipt</Label>
                                <Input id="receipt" type="file" {...register("receipt")} />
                                {errors.receipt && <p className="text-destructive text-sm">{errors.receipt.message as string}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2"/>}
                                Submit Claim
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Claims History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="animate-spin"/></TableCell></TableRow> : 
                            claims?.map(claim => (
                            <TableRow key={claim.id}>
                                <TableCell>{new Date(claim.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{claim.description}</TableCell>
                                <TableCell>${claim.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                <Badge variant={
                                    claim.status === 'Approved' ? 'default' :
                                    claim.status === 'Pending' ? 'secondary' :
                                    'destructive'
                                }>{claim.status}</Badge>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
       </div>
    </div>
  );
}