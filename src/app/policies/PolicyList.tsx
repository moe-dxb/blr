
'use client';

import { useCallback, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Policy } from './Policies';

interface PolicyListProps {
  initialPolicies: Policy[];
  loading: boolean;
  error: string | null;
}

const PolicySkeleton = () => (
    <div className="space-y-2 border-b">
        <Skeleton className="h-12 w-full" />
    </div>
)

export function PolicyList({ initialPolicies, loading, error }: PolicyListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acknowledging, setAcknowledging] = useState<Record<string, boolean>>({});
  
  const handleAcknowledge = useCallback(async (policyId: string) => {
    if (!user) return;

    setAcknowledging(prev => ({ ...prev, [policyId]: true }));
    try {
        const policyRef = doc(db, 'policies', policyId);
        await updateDoc(policyRef, {
            acknowledgements: arrayUnion(user.uid)
        });
        toast({ title: "Policy Acknowledged", description: "Thank you for reviewing the policy."});
    } catch (err) {
        console.error("Acknowledgement error: ", err);
        toast({ title: "Error", description: "Failed to acknowledge the policy.", variant: "destructive" });
    } finally {
        setAcknowledging(prev => ({ ...prev, [policyId]: false }));
    }
  }, [user, toast]);
  
  if (loading) {
      return (
          <div className="space-y-4">
              {Array.from({length: 3}).map((_, i) => <PolicySkeleton key={i} />)}
          </div>
      )
  }

  if (error) {
      return <p className="text-destructive text-center">{error}</p>
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {initialPolicies.map((policy) => (
        <AccordionItem value={policy.id} key={policy.id}>
          <AccordionTrigger>{policy.title}</AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none pb-4" dangerouslySetInnerHTML={{ __html: policy.content }}></div>
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Published on {new Date(policy.createdAt).toLocaleDateString()}
              </p>
              {user && (
                <div>
                    {policy.acknowledgements.includes(user.uid) ? (
                        <span className="text-xs text-green-600 font-semibold">Acknowledged</span>
                    ) : (
                        <Button onClick={() => handleAcknowledge(policy.id)} size="sm" disabled={acknowledging[policy.id]}>
                            {acknowledging[policy.id] ? "Saving..." : "Acknowledge"}
                        </Button>
                    )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
