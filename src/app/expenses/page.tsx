
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
import { PlusCircle } from "lucide-react";

const claims = [
  { id: 1, date: '2024-07-18', description: 'Client Lunch Meeting', amount: 75.50, status: 'Approved' },
  { id: 2, date: '2024-07-20', description: 'Office Supplies', amount: 120.00, status: 'Pending Manager' },
  { id: 3, date: '2024-07-22', description: 'Travel to Conference', amount: 450.00, status: 'Pending C-Level' },
  { id: 4, date: '2024-07-15', description: 'Software Subscription', amount: 29.99, status: 'Rejected' },
];

export default function ExpenseClaimPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Expense Claims</h1>
          <p className="text-muted-foreground">
            Submit and track your expense claims.
          </p>
        </div>
      </div>

       <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">New Expense Claim</CardTitle>
                        <CardDescription>Fill in the details for your new claim.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date of Expense</Label>
                            <Input id="date" type="date" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="category">Category</Label>
                             <Select>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="meals">Meals & Entertainment</SelectItem>
                                    <SelectItem value="travel">Travel</SelectItem>
                                    <SelectItem value="supplies">Office Supplies</SelectItem>
                                    <SelectItem value="software">Software</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="amount">Amount (USD)</Label>
                            <Input id="amount" type="number" placeholder="e.g., 50.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" placeholder="e.g., Lunch with ACME Inc." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="receipt">Upload Receipt</Label>
                            <Input id="receipt" type="file" />
                        </div>
                         <Button className="w-full">
                            <PlusCircle className="mr-2"/>
                            Submit Claim
                         </Button>
                    </CardContent>
                </Card>
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
                            {claims.map(claim => (
                            <TableRow key={claim.id}>
                                <TableCell>{claim.date}</TableCell>
                                <TableCell className="font-medium">{claim.description}</TableCell>
                                <TableCell>${claim.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                <Badge variant={
                                    claim.status === 'Approved' ? 'default' :
                                    claim.status.startsWith('Pending') ? 'secondary' :
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
