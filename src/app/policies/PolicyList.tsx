
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, deleteDoc, query, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Policy {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    acknowledgements?: string[];
}

interface PolicyListProps {
    initialPolicies: Policy[];
}

export function PolicyList({ initialPolicies }: PolicyListProps) {
    const { user, role } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPolicy, setNewPolicy] = useState({ title: '', content: '' });
    const { toast } = useToast();
    const isAdmin = role === 'Admin';

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, "policies")), (snapshot) => {
            const policyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Policy));
            setPolicies(policyList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAcknowledge = async (policyId: string) => {
        if (!user) return;
        const policy = policies.find(p => p.id === policyId);
        if (policy && !policy.acknowledgements?.includes(user.uid)) {
            await setDoc(doc(db, "policies", policyId), { acknowledgements: [...(policy.acknowledgements || []), user.uid] }, { merge: true });
            toast({ title: "Success", description: "Policy acknowledged." });
        }
    };
    
    const handleAddPolicy = async () => {
        if (!newPolicy.title || !newPolicy.content) {
            toast({ title: "Error", description: "Title and content are required.", variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        await addDoc(collection(db, "policies"), { ...newPolicy, createdAt: serverTimestamp(), acknowledgements: [] });
        setIsSaving(false);
        setIsDialogOpen(false);
        setNewPolicy({ title: '', content: '' });
        toast({ title: "Success", description: "New policy published." });
    };

    const handleDeletePolicy = async (policyId: string) => {
        if (confirm("Are you sure you want to delete this policy?")) {
            await deleteDoc(doc(db, "policies", policyId));
            toast({ title: "Success", description: "Policy deleted.", variant: "destructive" });
        }
    };


    if (loading) {
        return <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Policy Hub</CardTitle>
                        <CardDescription>Review and acknowledge company policies.</CardDescription>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Policy
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {policies.map((policy) => (
                         <Card key={policy.id} className="p-4">
                           <div className="flex justify-between">
                             <h3 className="font-semibold">{policy.title}</h3>
                             {isAdmin && <Button variant="ghost" size="icon" onClick={() => handleDeletePolicy(policy.id)}><Trash2 className="h-4 w-4" /></Button>}
                           </div>
                           <p className="text-sm text-muted-foreground whitespace-pre-wrap">{policy.content}</p>
                           <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-muted-foreground">Acknowledged by: {policy.acknowledgements?.length || 0}</span>
                            <Button size="sm" onClick={() => handleAcknowledge(policy.id)} disabled={policy.acknowledgements?.includes(user?.uid || '')}>
                                {policy.acknowledgements?.includes(user?.uid || '') ? <CheckCircle className="mr-2 h-4 w-4"/> : null}
                                {policy.acknowledgements?.includes(user?.uid || '') ? 'Acknowledged' : 'Acknowledge'}
                            </Button>
                           </div>
                         </Card>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add a New Policy</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="title">Policy Title</Label>
                        <Input id="title" value={newPolicy.title} onChange={(e) => setNewPolicy({...newPolicy, title: e.target.value})} />
                        <Label htmlFor="content">Policy Content</Label>
                        <Textarea id="content" value={newPolicy.content} onChange={(e) => setNewPolicy({...newPolicy, content: e.target.value})} rows={10} />
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                         <Button onClick={handleAddPolicy} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Policy
                         </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
