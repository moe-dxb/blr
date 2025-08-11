
'use client';
import { useState } from 'react';
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

interface Policy {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  acknowledgements: string[];
}

interface PolicyListProps {
  initialPolicies: Policy[];
}

export function PolicyList({ initialPolicies }: PolicyListProps) {
  const { user } = useAuth();
  const [policies, setPolicies] = useState(initialPolicies);

  const handleAcknowledge = async (policyId: string) => {
    if (!user) return;
    
    const policyRef = doc(db, 'policies', policyId);
    await updateDoc(policyRef, {
      acknowledgements: arrayUnion(user.uid)
    });

    setPolicies(policies.map(p => 
      p.id === policyId ? { ...p, acknowledgements: [...p.acknowledgements, user.uid] } : p
    ));
  };
  
  return (
    <Accordion type="single" collapsible className="w-full">
      {policies.map((policy) => (
        <AccordionItem value={policy.id} key={policy.id}>
          <AccordionTrigger>{policy.title}</AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: policy.content }}></div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Published on {new Date(policy.createdAt).toLocaleDateString()}
              </p>
              {user && !policy.acknowledgements.includes(user.uid) && (
                <Button onClick={() => handleAcknowledge(policy.id)}>
                  Acknowledge
                </Button>
              )}
               {user && policy.acknowledgements.includes(user.uid) && (
                <p className="text-xs text-green-500">Acknowledged</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
